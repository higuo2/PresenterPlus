# Hand Gesture Presentation Controller

This is a standalone macOS companion for PresenterPlus. It uses OpenCV, MediaPipe, PyAutoGUI, and native AppKit overlays to control whichever presentation window is in front — including a full-screen PresenterPlus **Audience display** browser tab.

It is intentionally not wired into the React application. Start it separately; it controls the active presentation with keyboard events and draws its laser/ink overlay at the operating-system level.

## Prerequisites

- macOS and Python 3.12
- A camera
- Accessibility permission for the terminal app that launches this controller, so PyAutoGUI can press Left/Right arrow keys
- Camera permission for that terminal app

## Run

From this folder:

```bash
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python main.py
```

When macOS asks, allow Camera and Accessibility access. Press `q` to quit the controller. PyAutoGUI's corner failsafe remains enabled: move the pointer to the top-left screen corner if you need to interrupt control immediately.

## Use with Audience display

1. Start PresenterPlus normally and open **Audience display** in a browser tab or window.
2. Put that window in browser full-screen if desired.
3. Run this controller from this folder. Its small camera-preview panel stays above the presentation; the laser and drawing layer are transparent system overlays.
4. Show a fist for about 0.3 seconds to unlock control. Show it again to lock control.
5. Use hand gestures while the Audience display is the foreground presentation window.

## Controls

| Gesture | Action |
| --- | --- |
| Fist | Lock or unlock gesture control |
| Wave with right hand | Next slide (Right arrow) |
| Wave with left hand | Previous slide (Left arrow) |
| One finger | Draw annotation |
| Two fingers | Laser while presenting; pointer otherwise |
| Three fingers | Undo the last annotation |
| Four or more fingers | Clear annotations |

## Notes

- This controller is macOS-specific: it uses AppKit, Quartz, and `osascript` to place overlays and detect slideshow state.
- It controls the focused presentation window rather than using PresenterPlus's internal React state. Do not run another application that also consumes the same camera at the same time.
- The source is kept as an independent folder so its dependencies and lifecycle cannot interfere with the web application.
