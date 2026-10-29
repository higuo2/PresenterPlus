# PresenterPlus implementation progress

## Final verified status, 2026-10-26

The six features below were implemented and checked in the local preview. `pnpm build` passes.

## Shared presentation lifecycle

1. **Start presentation** begins a clean session: timer, captions, pace samples, Q&A data, and presentation state reset.
2. Starting a session begins browser live captions and Smart Teleprompter auto-scroll. The presenter can pause either feature on its own.
3. **Pause session** keeps the data. **End presentation** stops captioning, recording, gesture detection, and teleprompter scrolling, and keeps the finished session for analytics.
4. A new presentation clears the previous session, so captions, pace data, and timers do not carry into the next talk.

## 1. Smart Teleprompter

### Delivered behaviour

- Previous, current, and upcoming script lines are visible. **YOU'RE HERE** marks the active line.
- Each line has a duration from its word count and punctuation pauses. Longer lines, and lines with more punctuation, stay on screen longer.
- Auto-scroll is off while the workspace is idle. It starts with **Start presentation**, and the Auto-scroll pill can turn it off or on.
- Clicking a visible line, the skip and revisit controls, and a slide change all move the same prompt. A click puts **YOU'RE HERE** on that line immediately.
- Scrolling stays inside the active slide's script.

### Test procedure

1. Open Presenter workspace and verify Auto-scroll is inactive before the session starts.
2. Select **Start presentation**. Confirm captions start and Auto-scroll becomes active.
3. Wait for the calculated reading duration and confirm **YOU'RE HERE** advances.
4. Toggle Auto-scroll off and on; verify the position pauses and resumes.
5. Click an earlier or upcoming visible line, then switch slides. The prompt should jump to the clicked line, and a new slide should start at its first line.

## 2. Live Pacing Coach

### Delivered behaviour

- Confirmed English caption words are measured in an eight-second window and recalculated every two seconds.
- **Slow** is below 120 WPM, **Optimal** is 120-140, and **Fast** is above 140. A silent gap keeps the last pace. Silence is not Slow.
- The presenter workspace, the Pacing coach, and the Audience display share that pace. The light on the Audience display uses slate, sky, emerald, and amber for the same states.
- The Pacing coach shows WPM, a status badge, the target range, a recent trace, session metrics, a coaching line, a tip for the current slide, and a peak mark after a fast stretch returns to the target range.
- Its title bar, status pill, stat cards, and timeline header use the same visual system as the Presenter workspace.

### Test procedure

1. Select **Start presentation** and allow microphone access in Chrome.
2. Speak a comfortable English sentence for around ten seconds. Confirm WPM and an Optimal state when the rate is in range.
3. Speak quickly. Confirm Fast, in amber, on the coach, the workspace, and the Audience display light.
4. Return to a comfortable rate. Confirm Optimal returns and the finished fast stretch leaves a peak on the chart.
5. Pause briefly and confirm silence alone does not switch the rate to Slow.
6. Restart the presentation and confirm the rate, chart, and metrics reset.

## 3. Gesture entry into Q&A

### Delivered behaviour

- The gesture camera is manual. It does not start on page load or when a session starts.
- **Start gesture camera** asks for the camera and shows a preview at the lower right only while it is on.
- Hand landmarks use TensorFlow and WASM, so the page does not need WebGL.
- Q&A opens after two hands stay visible for 0.8 seconds. A face alone does not open it.
- The footer reports camera permission, whether the camera is in use, the detector, and one-hand or two-hand state.

### Test procedure

1. Start a presentation and confirm the footer says **Camera off**.
2. Select **Start gesture camera**, allow camera access, and confirm the preview asks for both hands.
3. Hold both hands in view for about one second. Confirm Q&A opens.
4. Return to the workspace, enable the camera again, then stop it and confirm the preview disappears.

### Separate macOS controller

The repository also includes [`hand-gesture-controller/`](hand-gesture-controller/README.md). It is a macOS program, started on its own, and the project owner tested it. It does not talk to the React app. It uses the camera, AppKit and Quartz overlays, and PyAutoGUI arrow keys to control the foreground window, such as a full-screen Audience display. Gestures cover fist lock and unlock, left and right waves for slides, and finger counts for laser, drawing, undo, and clear. Setup and the Camera and Accessibility permissions are in its own README.

## 4. Q&A transition and capture

### Delivered behaviour

- **Enter Q&A mode** opens the Q&A screen, resets a five-minute timer, and tries to record audio in memory.
- Q&A also opens from the two-hand gesture or the live-caption command `Enter Q&A`.
- Q&A can pause, resume, add a minute, and bookmark the transcript. Playback of the in-memory recording works when `MediaRecorder` is available.
- **End Q&A** or `End Q&A` returns to the talk and keeps the session data. If permission or recording fails, the timer still runs.

### Test procedure

1. Start a presentation, select **Enter Q&A mode**, and allow microphone access.
2. Check the timer, the recording state, **+1 minute**, pause, and resume.
3. With captions on, speak an English question and confirm the latest transcript bookmark appears.
4. End Q&A with the button or the voice command and confirm the workspace returns.

## 5. Live captions, audience display, and session notes

### Delivered behaviour

- Browser `SpeechRecognition` / `webkitSpeechRecognition` is set to English (`en-US`). Interim and final captions are handled separately.
- Each final caption keeps its time and slide number.
- The presenter workspace and the Audience display share captions, microphone state, and pace through the `presenterplus-live-captions` BroadcastChannel.
- The Audience display is a dark slide area with a two-line glass caption bar. The slide stays the largest element.
- The Audience display starts empty and receives captions only from the active presentation. Start and end clear every Audience display tab. Old captions are not restored from local storage.
- The full-screen button calls `document.documentElement.requestFullscreen()`.
- **Structured session notes** downloads a text file grouped by slide, with a timestamp on each caption.

### Test procedure

1. Open Presenter workspace and Audience display in separate tabs on the same browser profile and origin.
2. Confirm Audience display opens with the empty subtitle and without captions from an earlier session.
3. Start a session, allow microphone access, and say: `Sales came in where we expected.`
4. Confirm interim and final text appear in the caption bar.
5. Change slides, speak again, export **Structured session notes**, and check for `Slide NN` sections with timestamps.
6. End or restart the presentation and confirm captions clear in the audience tab.
7. Select expand and confirm the browser enters and leaves full screen.

## 6. Attention monitoring and session analytics

### Delivered behaviour

- **Attention dashboard** and **Audience** use the optional `classroom-attention-monitor` Python service. If that service is offline, the pages show demonstration data.
- The Attention dashboard shows the room average, presence, phone moments, hand raises, blink rate, duration, the live frame, activity, attention history, engagement distribution, and phone use.
- Audience uses anonymous labels only, with attention, last seen, forward ratio, phone, hand, and blink signals, plus an individual curve. Names are not stored.
- The Attention UI opens on a built-in **Demo session**. **Start stream** switches to the local camera. **Stop session** waits for the local service to save the session, then selects that saved session. Both Attention dashboard and Audience list saved sessions. Choosing one loads its stored numbers instead of the demo.
- Session analytics reports the presentation that just ended. Its attention area uses a smooth area-spline chart, a peak marker, distribution, activity, and phone-use summaries, separate from the pacing panel.

### Test procedure

1. Start the Python service on port 8000 as described below, then open `/attention`.
2. Select **Start stream**, wait for the first frame, and confirm the metrics update.
3. Open **Audience** and confirm it reads the same anonymous session.
4. Select **Stop session**. Confirm that session stays selected, then choose it again from the selector on both Attention dashboard and Audience and confirm the recorded metrics are still there.
5. Start and end a presentation, open **Session analytics**, and check the completed-session header, the pacing panel, and the attention panel.

## Optional attention service setup

The camera service is the local `classroom-attention-monitor` folder. From that folder, run:

```powershell
cd classroom-attention-monitor
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

Then run this project with `pnpm dev` and open the local preview.

## Verification record

- The flows above were tested in the local preview and accepted by 2026-10-26.
- `pnpm build` passes.
- `pnpm exec oxfmt src/app/App.tsx src/app/Attention.tsx` passes.
- `git diff --check` passes.

## Platform constraints

- Live captions need browser speech recognition and microphone permission. The language is English (`en-US`).
- The attention service loads its vision models before the first live frame, so a short Connecting state is expected.
- Structured session notes export as plain text, not PDF.
