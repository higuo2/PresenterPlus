# PresenterPlus implementation progress

## Completed: Live captions and structured session notes

Status: tested successfully in the local preview on 2026-10-21, including the manual Auto-scroll start control.

This is the implementation of Task 5 from the project description: live captions and automatically structured presentation notes.

### What works now

1. The **Start live captions** control in Presenter workspace starts and stops browser speech recognition.
2. The browser continuously transcribes the presenter's English speech while captioning is active.
3. Interim text is displayed immediately; confirmed transcript segments are recorded with a timestamp and the current slide number.
4. The Audience Display receives live transcript updates from the Presenter workspace, including when it is open in a separate tab.
5. **Structured session notes** exports a text file grouped by slide. Each recognised segment includes its capture time.
6. If the browser does not implement the Web Speech Recognition API, the interface explains that a supported browser is required. If microphone permission is denied, the interface reports that microphone permission is needed.
7. Captured, confirmed captions are saved in browser local storage so they remain available after the Audience Display is opened or refreshed.

### Implementation notes

- Main implementation file: `src/app/App.tsx`
- Speech API: `SpeechRecognition` / `webkitSpeechRecognition`
- Recognition language: `en-US`
- Caption data shape: slide number, recognised text, and capture time
- Cross-tab synchronisation: `BroadcastChannel` named `presenterplus-live-captions`
- Local persistence key: `presenterplus-captions`
- Export format: plain-text `.txt` file, named `PresenterPlus-session-notes.txt`

### Test procedure

Use Chrome or another browser that supports the Web Speech Recognition API. Keep the Presenter workspace and Audience Display on the same browser profile and local preview origin.

1. Open the local project preview at `http://127.0.0.1:8444/`.
2. Confirm that the main slide area displays the Finance Report image and that the top wave button says **Start live captions**.
3. Open **Audience display** in a second tab, either with the top-right button or the left navigation item.
4. Return to Presenter workspace and click **Start live captions**.
5. When the browser asks for microphone permission, choose **Allow**.
6. Speak an English test sentence, for example: `Sales came in where we expected.`
7. Confirm that the button changes to **Captions listening**.
8. Confirm that the sentence appears in the Audience Display caption bar. While speaking, the status can show `Listening...`; once a phrase is finalised it becomes a saved caption segment.
9. Change to another slide, speak another English sentence, and confirm that it is shown in the Audience Display.
10. In Audience Display, click **Structured session notes** and open the downloaded text file.
11. Confirm that recognised text is grouped under the correct `Slide NN` headings, with timestamps.
12. Return to Presenter workspace and click **Captions listening** to stop recognition. Confirm that no new interim caption is displayed.

### Verification completed

- `pnpm build` passes.
- `oxfmt --check src/app/App.tsx` passes.
- Main Presenter workspace loads with all slide images.
- Audience Display route loads and renders the live-caption area.
- End-to-end microphone and caption test was completed successfully by the project user.

### Current limitations

- Recognition is currently configured for English (`en-US`) only.
- The feature relies on the browser's speech-recognition implementation and its microphone permission flow; it is not a self-hosted speech-to-text service.
- The notes export is a structured text file, not yet a PDF document.
- Current live slide navigation is not synchronised between separately opened Presenter and Audience tabs. Captions are synchronised; the next presentation-control task should synchronise the current slide as well.

## Completed: Smart Teleprompter pace tracking

Status: tested successfully in the local preview on 2026-10-21.

### What works now

1. The Smart Teleprompter stays still by default. Clicking its **Auto-scroll** control starts pace-based advancement; clicking it again pauses advancement. It does not wait for speech recognition.
2. Each script line remains visible for a duration calculated from its complete word count plus natural comma, semicolon, colon, dash, and sentence-ending pauses. This prevents short words from being ignored and gives longer or more punctuated lines more reading time.
3. Auto-scroll is constrained to the current slide's script range. It stops at the final line of that slide and waits for the presenter to move to the next slide.
4. The compact **Auto-scroll** button gives a clear active/inactive state without showing a WPM value. Internally, timing still uses the presentation pace estimate.
5. The visible previous, current, and upcoming script lines are all clickable. Clicking any line immediately sets **YOU'RE HERE** to that line and resumes pace-based auto-scroll from there.
6. Existing **Swipe up to skip** and **Swipe down to revisit** controls use the same repositioning logic.
7. Live captions remain enabled for the audience and session notes, but do not control the teleprompter position.

### Smart Teleprompter test procedure

1. Open Presenter workspace and refresh the page so the latest implementation is loaded.
2. Confirm the Smart Teleprompter control says **Auto-scroll** and has a grey dot. Wait for several seconds and confirm that **YOU'RE HERE** does not move.
3. Click **Auto-scroll**. Confirm that its dot turns blue and, after the estimated reading duration of the current line, **YOU'RE HERE** moves to the next sentence without enabling the microphone.
4. Click **Auto-scroll** again and confirm that the prompt remains on its current line. Click once more to resume, then confirm that auto-scroll stops at the last script line for the current slide.
5. Click the previous visible script line. Confirm that **YOU'RE HERE** immediately returns to it, then continues automatically.
6. Click an upcoming visible line. Confirm that the prompt jumps there immediately and continues at the same estimated pace.
7. Use **Swipe up to skip** and **Swipe down to revisit**. Confirm they also reposition the prompt and continue auto-scroll.
8. Move to Slide 02. Confirm that the prompt resets to the first script line for Slide 02 and starts its new timing cycle.
9. Confirm that the interface does not display the internal WPM value; it shows only the **Auto-scroll** control.

### Verification completed

- `pnpm build` passes.
- `oxfmt --check src/app/App.tsx` passes.
- Pace-based auto-scroll advances without microphone input.
- Clicking a visible script line immediately repositions **YOU'RE HERE** and resumes auto-scroll.
- The project user completed the timed end-to-end test successfully.
- The project user confirmed that Auto-scroll stays stopped on entry and starts only after clicking the **Auto-scroll** control.

## Completed: Q&A mode transition and review capture

Status: tested successfully in the local preview on 2026-10-21. Microphone permission is required for the optional audio-recording portion of the test.

### What works now

1. **Enter Q&A mode** changes the application to the focused Q&A screen, hides the presenter workspace, resets the five-minute Q&A timer, and starts an audio recording attempt.
2. **End Q&A** stops the recording, returns to lecture mode, and bookmarks the captured audio in memory for post-talk review.
3. When live captions are active, the voice commands `Enter Q&A` and `End Q&A` also switch between the two modes.
4. The Q&A view clearly shows whether audio recording is active, has a pause/resume timer, supports adding one minute, and displays the most recent Q&A transcript bookmark.
5. Confirmed live-caption segments received during Q&A are saved as Q&A transcript bookmarks.
6. If the browser supports `MediaRecorder`, ending a recorded Q&A produces an in-memory audio clip; playback is available before leaving the Q&A screen.
7. If recording is unavailable or microphone permission is denied, the interface reports the reason without interrupting the Q&A timer.
8. Camera-based Q&A entry is **manual**. The presenter clicks **Start gesture camera** in the footer to enable local hand detection; the camera stays off on page load. When the local model detects two hands continuously for 0.8 seconds, the application enters Q&A mode automatically.

### Q&A test procedure

1. Open Presenter workspace and ensure the latest preview is loaded.
2. Optional: start live captions first if you want to test voice commands and transcript bookmarks.
3. Click **Enter Q&A mode** in the bottom-right corner.
4. Allow microphone access when requested. Confirm that the Q&A page displays a pulsing red recording indicator and a five-minute timer.
5. Speak an English question while live captions are active. Confirm that the Q&A transcript-bookmark count increases and the latest transcript is shown.
6. Click **+1 minute** and verify that the timer increases by one minute. Click **Pause timer** and **Resume** to verify timer control.
7. If captions are active, say `End Q&A`. Otherwise click **End Q&A**. Confirm that lecture mode returns and the Q&A audio is bookmarked for later review.
8. Enter Q&A again and say `End Q&A` to verify the voice-driven mode transition.
9. Return to Presenter workspace and confirm that the footer says **Camera off**. Click **Start gesture camera**, allow camera access, and confirm that the footer changes to **Gesture camera on**, a small live camera preview appears at the lower-right, and the status becomes **Show both open palms** or **One hand found - show both hands**.
10. Hold both hands toward the camera for about one second. The status should change to **Two hands detected - hold briefly**, then Q&A mode should open automatically.
11. Return to Presenter workspace, start the gesture camera again, and click **Gesture camera on**. Confirm that it stops the camera and the footer returns to **Camera off**.

### Gesture-camera troubleshooting

- The app now reports distinct causes for a denied permission, a missing camera, a camera already being used by another app, and a hand-detection startup error. The exact failure also remains beside the footer camera control after the notification disappears.
- If the status says that the camera is in use, close Zoom, FaceTime, Photo Booth, or another browser tab that is using the camera, then retry.
- Keep both hands fully inside the small preview, with palms facing the camera and all fingers separated. Once the detector sees two hands continuously for 0.8 seconds, it enters Q&A; this avoids fragile, camera-angle-dependent per-finger thresholds.
- Gesture recognition uses a TensorFlow WASM hand-keypoint model, so it works without WebGL. It recognises hand landmarks rather than skin colour; a face alone cannot trigger Q&A. The presenter must show two detected hands for 0.8 seconds.

### Verification completed

- `pnpm build` passes.
- `oxfmt --check src/app/App.tsx` passes.
- The project user successfully completed the end-to-end manual camera-start and two-hand Q&A transition test.

## Completed: Attention dashboard in place of ambient sensing

Status: tested and accepted in the local preview on 2026-10-26.

This replaces the ambient-sensing half of Task 2. Attention dashboard and Students read the camera through the Python service in `classroom-attention-monitor`. The old Audience sensing page is now Pacing coach at `/sensing`. Live speaking-rate behaviour is described in the next section and has not been confirmed in a speaking test.

### What works now

1. **Attention dashboard** at `/attention` shows the selected session: class average, present count, phone incidents, hand raises, blink rate, duration, the live frame, the activity list, attention over time, the engagement bands, and phone usage.
2. **Students** at `/students` uses the same selected session. Cards show an anonymous label, track id, last seen time, score, forward ratio, phone, hand raise, blinks, and a per-student curve. Names are not stored.
3. The session menu defaults to **Latest session**. Leaving the menu on Latest follows the active recording. Choosing a numbered session keeps the charts on that session.
4. **Start stream** opens camera `0`, records a session named Live session, and switches the button to **Stop session**. The button changes as soon as it is clicked. The status stays on Connecting… until the first frame. Class average, people in frame, phones, hand raises, and the time chart then follow the live frames.
5. **Stop session** stops the recording and turns the camera off.
6. With a session running, the selected session refreshes about every 2 seconds. While idle, it refreshes about every 15 seconds. The choice made on one page is still selected on the other.
7. If the Python service is not running, the pages show a built-in set of numbers.

### How to run it

From `classroom-attention-monitor`, with its existing Python 3.12 virtual environment:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.asgi:app --host 127.0.0.1 --port 8000
```

Then, from this project, `pnpm dev`, and open http://localhost:8443/attention .

### Test procedure

1. Start the Python service on port 8000, then open http://localhost:8443/attention .
2. Confirm the menu says **Latest session** and the live panel says **Start stream**.
3. Click **Start stream**. Confirm the button changes to **Stop session** and the status shows Connecting… before a frame arrives.
4. After the first frame, confirm the picture appears and the class-average number moves with the room.
5. Open **Students** and confirm the cards belong to the same session, with no personal names.
6. Pick an earlier session, such as a seeded lesson, and confirm the charts stay on that session while the camera can still be running.
7. Return to **Latest session**, click **Stop session**, and confirm the preview clears and the button returns to **Start stream**.

### Verification completed

- The project user confirmed on 2026-10-26 that the attention dashboard and students flows are tested and finished.

### Current limitations

- The first frame waits while the face, pose, and object models load for that session.
- The laptop camera can return a grey placeholder frame until the camera itself is delivering a picture. That is outside this page.
- Attention distribution on the dashboard uses the labels Excellent, Good, Low, and Very low. Student cards use Excellent, Good, Warning, and Critical.
- The old Audience sensing page is now **Pacing coach** at `/sensing`. Room-energy events are gone. Speaking-rate behaviour is in the next section.

## In progress: live pacing from confirmed captions

Status: implemented in the local preview on 2026-10-26. Not tested by the project user. Do not treat this section as finished.

The Pacing coach no longer shows a fixed 185 WPM sample. Presenter workspace and `/sensing` share one measured rate. Session analytics still uses its original demonstration pacing chart.

### Logic

1. **Start live captions** is the only input. The browser speech recogniser stays on `en-US`. A second microphone session is not opened.
2. Only final caption text is counted. Interim text is ignored, because the recogniser rewrites the same phrase until the phrase is confirmed. Words are split on spaces and stamped with the confirmation time and the current slide number.
3. Every 2 seconds, words older than 8 seconds are dropped. If any words remain, WPM is `word count / 8 × 60`.
4. Bands: 120–140 is the green “You're in a great rhythm” state; above 140 is the amber “Speaking rate too fast. Take a breath and pause at commas.” state; below 120 is the blue “Pace is a little low. Keep your energy up!” state.
5. An empty 8-second window does not switch the banner to slow. The last band stays until a new confirmed phrase arrives. Before the first phrase, both pages say to start live captions.
6. Each 2-second sample is appended to the speaking-rate chart on the Pacing coach page. A run that goes above 140 and then returns to 140 or below leaves one peak marker, labelled with the WPM and the slide at the highest sample in that run. Stopping captions seals an unfinished peak. Starting captions again clears the words, the chart, and the current rate.
7. The slide frame and the bottom edge follow the same band on Presenter workspace and Pacing coach. There is no heartbeat control.

### How to test later

Use Chrome. Open Presenter workspace or Pacing coach, start live captions, and speak English for about 10 seconds.

1. Before captions start, the banner asks to start live captions. The rate reads as a dash.
2. At a comfortable pace, the banner turns green and the number sits around 120–140.
3. Speaking quickly turns the banner amber. After the rate falls back to 140 or below, the Pacing coach chart shows one peak and the slide number.
4. Pausing for several seconds does not turn the banner blue by itself.
5. Starting captions again clears the previous chart.

### Not verified

- No end-to-end speaking test has been run.
- `pnpm build` was not re-run for this change.
