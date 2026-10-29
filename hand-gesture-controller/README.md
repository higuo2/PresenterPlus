# Hand Gesture Presentation Controller

This macOS program runs beside PresenterPlus. It uses OpenCV, MediaPipe, PyAutoGUI, and AppKit overlays to control the presentation window in front, including a full-screen PresenterPlus **Audience display** tab.

It is not connected to the React app. Start it on its own. It sends keyboard events to the active window and draws the laser and ink as system overlays.

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

When macOS asks, allow Camera and Accessibility access. Press `q` to quit. PyAutoGUI's corner failsafe stays on: move the pointer to the top-left corner to stop control at once.

## Use with Audience display

1. Start PresenterPlus and open **Audience display** in a browser tab or window.
2. Put that window in browser full screen if you want it full screen.
3. Run this controller from this folder. The small camera preview stays above the presentation. The laser and drawing layer are transparent system overlays.
4. Hold a fist for about 0.3 seconds to unlock control. Hold it again to lock control.
5. Gesture while the Audience display is the foreground window.

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

- macOS only. Overlays use AppKit and Quartz, and slideshow detection uses `osascript`.
- It controls the focused window. It does not read PresenterPlus React state. Do not run another program on the same camera at the same time.
- The code stays in this folder so its dependencies and startup stay separate from the web app.
