import subprocess
import threading
import time

from collections import deque

# AppKit must load before MediaPipe. The other order deadlocks dyld for
# about a minute, so the terminal looks frozen and the window never appears.
import pyautogui
from src.preview_panel import PreviewPanel
from src.screen_ink import ScreenInk

import cv2
import mediapipe as mp

from src.finger_utils import count_fingers, is_fist
from src.swipe_detector import SwipeDetector

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

PREVIEW_W, PREVIEW_H = 420, 236


def watch_slideshow(flag, stop):
    """A large PowerPoint window is not a slideshow. Ask the app itself."""
    script = """
    if application "Microsoft PowerPoint" is running then
      tell application "Microsoft PowerPoint"
        if (count of slide show windows) > 0 then return "yes"
      end tell
    end if
    if application "Keynote" is running then
      tell application "Keynote"
        if (count of documents) > 0 then
          if playing of front document then return "yes"
        end if
      end tell
    end if
    return "no"
    """
    while not stop.is_set():
        try:
            out = subprocess.check_output(
                ["osascript", "-e", script],
                text=True,
                timeout=4,
            ).strip().lower()
            flag["on"] = out == "yes"
        except Exception:
            pass
        stop.wait(0.8)


_BROWSERS = {
    "Safari",
    "Google Chrome",
    "Chromium",
    "Microsoft Edge",
    "Firefox",
    "Arc",
    "Brave Browser",
    "Opera",
    "Orion",
    "Vivaldi",
}
_SLIDES = {"Microsoft PowerPoint", "Keynote"}


def _coverage(bounds, screens):
    x, y = float(bounds["X"]), float(bounds["Y"])
    w, h = float(bounds["Width"]), float(bounds["Height"])
    best = 0.0
    for sx, sy, sw, sh in screens:
        overlap_w = min(x + w, sx + sw) - max(x, sx)
        overlap_h = min(y + h, sy + sh) - max(y, sy)
        if overlap_w <= 0 or overlap_h <= 0:
            continue
        best = max(best, (overlap_w * overlap_h) / (sw * sh))
    return best


def _presentation_bounds(presenting):
    """The rectangle the preview should sit on.

    Stick to the frontmost browser window, including one that has just gone
    fullscreen. A PowerPoint or Keynote show wins while it is playing.
    Coordinates are AppKit points: origin at the bottom-left.
    """
    import os

    import Quartz
    from AppKit import NSScreen

    screens = NSScreen.screens()
    if not screens:
        return None
    primary_h = float(screens[0].frame().size.height)
    screen_frames = []
    for screen in screens:
        frame = screen.frame()
        screen_frames.append((
            float(frame.origin.x),
            primary_h - float(frame.origin.y) - float(frame.size.height),
            float(frame.size.width),
            float(frame.size.height),
        ))

    options = (
        Quartz.kCGWindowListOptionOnScreenOnly
        | Quartz.kCGWindowListExcludeDesktopElements
    )
    windows = Quartz.CGWindowListCopyWindowInfo(options, Quartz.kCGNullWindowID) or []
    pid = os.getpid()
    slide = None
    slide_coverage = 0.0
    browser = None
    for item in windows:
        if item.get("kCGWindowOwnerPID") == pid:
            continue
        layer = int(item.get("kCGWindowLayer") or 0)
        if layer < 0 or layer >= 24:
            continue
        bounds = item.get("kCGWindowBounds") or {}
        if "X" not in bounds:
            continue
        owner = item.get("kCGWindowOwnerName") or ""
        covered = _coverage(bounds, screen_frames)
        width = float(bounds["Width"])
        height = float(bounds["Height"])
        if presenting and owner in _SLIDES and covered > slide_coverage:
            slide = bounds
            slide_coverage = covered
        elif (
            browser is None
            and owner in _BROWSERS
            and width >= 480
            and height >= 320
        ):
            browser = bounds

    chosen = slide if slide is not None and slide_coverage >= 0.5 else browser
    if chosen is None:
        return None
    x = float(chosen["X"])
    y = float(chosen["Y"])
    w = float(chosen["Width"])
    h = float(chosen["Height"])
    return (x, primary_h - y - h, w, h)


# ---------------- DEBOUNCER ----------------
class StaticDebouncer:
    def __init__(self, hold_time=0.3):
        self.hold_time = hold_time
        self.current_gesture = None
        self.gesture_start_time = None

    def check(self, gesture):
        now = time.time()

        if gesture != self.current_gesture:
            self.current_gesture = gesture
            self.gesture_start_time = now if gesture else None
            return None

        if gesture is None:
            return None

        if now - self.gesture_start_time >= self.hold_time:
            return gesture

        return None

    def reset(self):
        self.current_gesture = None
        self.gesture_start_time = None


# ---------------- MAIN ----------------
def main():

    print("Loading camera...", flush=True)
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.82,
        min_tracking_confidence=0.75
    )

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    swiper = SwipeDetector(window=10, threshold=0.14, cooldown=1.0, max_y_drift=0.16)
    ink = ScreenInk()
    debounce = StaticDebouncer(0.3)
    fist_debounce = StaticDebouncer(0.3)

    is_locked = True
    fist_confirmed = False
    last_toggle_time = 0
    TOGGLE_COOLDOWN = 0.8

    active_mode = None
    swipe_label = ""
    swipe_time = 0
    last_undo_time = 0
    UNDO_COOLDOWN = 1.5
    prev_x = None
    prev_y = None
    smooth_factor = 0.35
    pointer_prev = None
    pointer_last_move_time = time.time()
    CLICK_DELAY = 0.5
    MOVE_THRESHOLD = 40

    stable_gesture = None
    gesture_start_time = 0

    from AppKit import (
        NSEvent,
        NSEventMaskKeyDown,
        NSEventModifierFlagCommand,
        NSEventModifierFlagControl,
        NSEventModifierFlagOption,
    )
    from Foundation import NSDate, NSDefaultRunLoopMode, NSRunLoop

    preview_panel = PreviewPanel(PREVIEW_W, PREVIEW_H)
    quit_flag = {"on": False}
    modifier_mask = (
        NSEventModifierFlagCommand
        | NSEventModifierFlagControl
        | NSEventModifierFlagOption
    )

    def on_quit_key(event):
        chars = event.charactersIgnoringModifiers() or ""
        if chars.lower() == "q" and (event.modifierFlags() & modifier_mask) == 0:
            quit_flag["on"] = True
        return event

    # Retain the monitors. A global monitor with no Python reference is dropped,
    # and q would stop working once the camera window no longer takes focus.
    quit_monitors = [
        NSEvent.addLocalMonitorForEventsMatchingMask_handler_(NSEventMaskKeyDown, on_quit_key),
        NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSEventMaskKeyDown, on_quit_key),
    ]
    presenting_flag = {"on": False}
    stop_watch = threading.Event()
    threading.Thread(
        target=watch_slideshow,
        args=(presenting_flag, stop_watch),
        daemon=True,
    ).start()

    print("Starting in 5 seconds...", flush=True)
    time.sleep(5)
    print("GO - show FIST to unlock!", flush=True)

    # ---------------- LOOP ----------------
    gesture_history = deque(maxlen=7)
    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            results = hands.process(rgb)
            rgb.flags.writeable = True

            presenting = presenting_flag["on"]

            lm = None
            handedness = None
            raw_static = None

            if results.multi_hand_landmarks and results.multi_handedness:

                hand_lm = results.multi_hand_landmarks[0]
                hand_info = results.multi_handedness[0]
                handedness = hand_info.classification[0].label
                hand_score = hand_info.classification[0].score
                lm = hand_lm.landmark

                mp_draw.draw_landmarks(frame, hand_lm, mp_hands.HAND_CONNECTIONS)

                # ---------------- FINGER SMOOTHING ----------------
                n = count_fingers(lm, handedness)
                gesture_history.append(n)

                stable_n = max(set(gesture_history), key=gesture_history.count)

                # ---------------- GESTURE ----------------

                # PRIORITY RULES
                if is_fist(lm, handedness):
                    raw_static = "FIST"

                elif n == 1:
                    raw_static = "DRAW"

                elif n == 2:
                    raw_static = "LASER" if presenting else "POINTER"

                elif n == 3:
                    raw_static = "UNDO"

                elif n >= 4:
                    raw_static = "PALM"
                else:
                    raw_static = None

                # Open palm wave: right hand goes forward, left hand goes back.
                # The camera image is mirrored, and MediaPipe labels that selfie view
                # as the presenter's own left and right.
                wrist_x = (lm[0].x + lm[9].x) / 2
                wrist_y = (lm[0].y + lm[9].y) / 2
                if is_locked:
                    swiper.reset()
                    wave = None
                else:
                    wave = swiper.update(wrist_x, wrist_y)

                if wave and raw_static == "PALM" and hand_score >= 0.6:
                    if handedness == "Right":
                        pyautogui.press("right")
                        ink.clear()
                        swipe_label = "Next"
                        swipe_time = time.time()
                    elif handedness == "Left":
                        pyautogui.press("left")
                        ink.clear()
                        swipe_label = "Prev"
                        swipe_time = time.time()

                # ---------------- FIST LOCK ----------------
                now = time.time()
                fist_held = is_fist(lm, handedness)

                if fist_held and not fist_confirmed:
                    if time.time() - last_toggle_time > TOGGLE_COOLDOWN:
                        confirmed = fist_debounce.check("FIST")

                        if confirmed == "FIST":
                            is_locked = not is_locked
                            fist_confirmed = True
                            last_toggle_time = time.time()
                            active_mode = None

                elif not fist_held:
                    fist_confirmed = False

                # ---------------- GESTURES ONLY WHEN UNLOCKED ----------------
                if not is_locked:
                    if raw_static == "LASER":
                        active_mode = "LASER"
                    elif raw_static == "POINTER":
                        active_mode = "POINTER"

                    instant_actions = {"UNDO", "CLEAR"}
                    if raw_static in instant_actions:
                        confirmed = raw_static
                    else:
                        confirmed = debounce.check(raw_static)

                    if confirmed == "DRAW":
                        active_mode = "DRAW"
                    elif confirmed == "LASER":
                        active_mode = "LASER"
                    elif confirmed == "POINTER":
                        active_mode = "POINTER"
                    elif confirmed == "UNDO":
                        if time.time() - last_undo_time > UNDO_COOLDOWN:
                            active_mode = "UNDO"
                            ink.undo()
                            last_undo_time = time.time()
                    elif confirmed in ("CLEAR", "PALM"):
                        ink.clear()
                        active_mode = "CLEAR"

                    print("RAW:", raw_static, "CONFIRMED:", confirmed)

            drawing = (not is_locked) and lm is not None and active_mode == "DRAW" and raw_static == "DRAW"
            pointing = (not is_locked) and lm is not None and raw_static == "POINTER" and not drawing
            lasing = (not is_locked) and lm is not None and raw_static == "LASER" and not drawing
            if drawing:
                ink.pen_move(lm[8].x, lm[8].y)
            else:
                ink.pen_up()
            if lasing:
                ink.set_laser(lm[8].x, lm[8].y)
            else:
                ink.hide_laser()
            if pointing:
                width, height = pyautogui.size()
                x = min(1.0, max(0.0, lm[8].x)) * width
                y = min(1.0, max(0.0, lm[8].y)) * height
                if prev_x is None:
                    prev_x, prev_y = x, y
                else:
                    prev_x = prev_x + (x - prev_x) * smooth_factor
                    prev_y = prev_y + (y - prev_y) * smooth_factor
                pyautogui.moveTo(prev_x, prev_y)
                now = time.time()
                if pointer_prev is not None:
                    if abs(x - pointer_prev[0]) > MOVE_THRESHOLD or abs(y - pointer_prev[1]) > MOVE_THRESHOLD:
                        pointer_last_move_time = now
                    elif now - pointer_last_move_time > CLICK_DELAY:
                        pyautogui.click()
                        pointer_last_move_time = now + 0.45
                pointer_prev = (x, y)
            else:
                prev_x = None
                pointer_prev = None
                pointer_last_move_time = time.time()
            ink.flush()

            preview = cv2.resize(frame, (PREVIEW_W, PREVIEW_H))

            if is_locked:
                cv2.rectangle(preview, (0, 0), (PREVIEW_W, 36), (0, 0, 90), -1)
                cv2.putText(preview, "LOCKED  fist to unlock",
                            (8, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (80, 80, 255), 2)
            else:
                cv2.rectangle(preview, (0, 0), (PREVIEW_W, 36), (0, 80, 0), -1)
                cv2.putText(preview, "UNLOCKED",
                            (8, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (80, 255, 80), 2)

            if time.time() - swipe_time < 1.5:
                cv2.putText(preview, swipe_label,
                            (8, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                            (0, 255, 255), 2)

            preview_panel.show(preview)
            preview_panel.place(_presentation_bounds(presenting))
            NSRunLoop.currentRunLoop().runMode_beforeDate_(
                NSDefaultRunLoopMode,
                NSDate.dateWithTimeIntervalSinceNow_(0.001),
            )

            if quit_flag["on"]:
                break
    except KeyboardInterrupt:
        pass

    stop_watch.set()
    cap.release()
    hands.close()
    preview_panel.close()
    ink.close()
    del quit_monitors


if __name__ == "__main__":
    main()
