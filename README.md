# PresenterPlus

PresenterPlus is a multimodal interface for a live English talk. The presenter uses a teleprompter, speech, gesture, and on-screen controls. The audience watches the slide and live captions. After the talk, the presenter can open pace detail, anonymous attention, and a session review.

Use this file to install and run the project.

The report uses two other files:

- [interaction-guide.md](interaction-guide.md) is the design to follow in the report.
- [implementation-limits.md](implementation-limits.md) is where the running program lags that design. Use it when you take screenshots. Do not paste it into the report.

## What you are opening

| Piece | Required? | What it is |
| --- | --- | --- |
| Web app | Yes | Presenter workspace, pacing, Q&A, audience display, attention pages, and session analytics. Chrome. |
| Attention service | No | Camera analysis for the Attention dashboard and the Audience page. Python 3.12. |
| Gesture controller | No | Slide changes, laser, and ink. macOS only. A separate program from the web app. |

**Start gesture camera** in the web app enters Q&A when both hands are held for about 0.8 seconds. Slide changes, the laser, and ink are the macOS program.

## 1. Install Node, then start the web app

You need Node.js 22, pnpm, and Chrome. Captions use Chrome's English speech recognition.

```bash
pnpm install
pnpm dev
```

The first install downloads the web dependencies. When it finishes, the terminal prints a local address, usually `http://localhost:8443/`. Open that address in Chrome. Leave this terminal running. Closing it stops the site.

Check it in this order:

1. Open the Presenter workspace and click **Start presentation**.
2. Allow the microphone when Chrome asks. Speak English for about ten seconds and look for captions and a pace band.
3. Open **Audience display** in a second browser tab. Do not open it from the sidebar of the tab that is presenting. That click resets the session.
4. After **End presentation**, open **Session analytics** to see the review layout.

If Chrome never asks for the microphone, set Microphone to Allow in the site permissions on the left of the address bar, then reload.

## 2. Attention service (optional)

Leave the `pnpm dev` terminal running and open a second terminal. The model files are already in `classroom-attention-monitor/models/`.

Windows (PowerShell):

```powershell
cd classroom-attention-monitor
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

macOS:

```bash
cd classroom-attention-monitor
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m alembic upgrade head
./.venv/bin/python -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

When the service is listening on `127.0.0.1:8000`, go back to PresenterPlus, open **Attention dashboard** (`/attention`), click **Start stream**, and allow the camera. **Audience** (`/audience-members`) reads the same session. If this service is not running, those two pages show sample cards. The rest of the app still works.

The attention service, the web gesture camera, and the macOS laser program each need a camera. One camera cannot run more than one of them at the same time.

## 3. Slides, laser, and ink (optional, macOS only)

This program does not join the web session. It sends arrow keys to the foreground window and draws on the screen. In a new terminal, from the project folder:

```bash
cd hand-gesture-controller
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python main.py
```

On first launch, allow the terminal to use the camera. Then open **System Settings → Privacy & Security → Accessibility** and allow the same terminal, so it can send the arrow keys. Put the PresenterPlus **Audience display** in front, full screen, before you gesture. Press `q` to quit. Move the pointer to the top-left corner to stop the laser and the ink. The gesture table is in [hand-gesture-controller/README.md](hand-gesture-controller/README.md).

## 4. Screens you can open

| Screen | Address | What you should see |
| --- | --- | --- |
| Presenter workspace | `/` | Current slide, three script lines, **YOU'RE HERE**, pace band, Start / Pause / End |
| Pacing coach | `/sensing` | WPM, Slow / Optimal / Fast, the 120-140 target, and a recent curve. Open it in another tab |
| Q&A | `/qa` | Five-minute timer, pause, add one minute, caption bookmarks. Also opened by **Enter Q&A mode** or the spoken command "Enter Q&A" |
| Audience display | `/audience` | Dark full screen, large slide, at most two caption lines, pace light. No teleprompter |
| Attention dashboard | `/attention` | Room attention. Sample data until **Start stream** |
| Audience | `/audience-members` | Anonymous curves labeled Audience 1, Audience 2. No real names |
| Session analytics | `/analytics` | Review layout after the talk. The chart numbers on this page are a fixed sample |

Pace bands: Slow is under 120 WPM, Optimal is 120-140, Fast is over 140. A silent gap keeps the last band.

**Structured session notes** download as `.txt` from the audience tab. Download them before **End presentation**. Ending the presentation clears the captions on that tab.

The gesture vocabulary for the report is in [interaction-guide.md](interaction-guide.md).

## 5. Stop and start again

1. In PresenterPlus, click **End presentation**.
2. Press `Ctrl+C` in each terminal. For the macOS gesture program, press `q` first.
3. Next time, `pnpm dev` is enough for the web app if `pnpm install` has already succeeded.
4. If a Python `.venv` already exists, repeat only the last command in that section. Create the virtual environment again only on a new computer, or after the `.venv` folder is deleted.
