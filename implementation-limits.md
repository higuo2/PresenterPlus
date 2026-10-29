# Implementation limits

The design is in [interaction-guide.md](interaction-guide.md). This file is what the program does not do yet. Do not paste these gaps into the report.

When you demo or take screenshots, follow the capture note in each section so the picture matches the report.

## The teleprompter does not jump with speech

In the report: confirmed English is matched to the current slide's script. YOU'RE HERE jumps to the sentence just spoken. With no new sentence, the line stays.

In the program: `findScriptMatch` exists and is never called. The teleprompter advances only while **Auto-scroll** is on and the presenter is still on the Presenter workspace, at a fixed 132 WPM plus pauses for punctuation. Speaking faster or slower does not change the line.

What to capture: a still frame of YOU'RE HERE with the previous line and the next line. Do not record the line jumping after a spoken sentence.

## Session analytics is a fixed layout

In the report: after the end, the presenter reviews this talk's pace, Q&A duration, and anonymous attention.

In the program: average pace 135, 4 filler words, Q&A 05:12, 92% engagement, and the two charts under them are fixed numbers and a fixed curve. Filler words are not detected. After the presentation ends, only the header may show this session's timer. The charts do not change. Live WPM appears on the workspace band and the Pacing coach.

Numbers from the attention service are not written into this page.

What to capture: use the page as a picture of the review layout. Do not say these numbers were computed from the talk you just gave.

## Gestures are two programs, and slide, laser, and ink need macOS

In the report: one camera, both hands for about 0.8 seconds enters Q&A, a wave changes slides, and the finger count chooses laser or ink.

In the program:

- **Start gesture camera** on the web page recognizes both hands for about 0.8 seconds, then opens `/qa`. It has no wave, laser, ink, or fist lock.
- `hand-gesture-controller` is a separate program and runs on macOS only. It does not read the web app's state. It sends arrow keys and draws on the current foreground window. The gestures are a fist, a left or right wave, and one to four fingers. It needs the camera and Accessibility permission.

**Laser on/off** on the workspace is not that laser. It places a dot on the presenter preview, and clicking it zooms the slide. The settings panel also says "Microphone and vision states are simulated." Do not screenshot that panel for the report.

What to capture: for a gesture into Q&A, capture both hands entering Q&A. Do not demo slide changes, laser, or ink on Windows. Do not write "macOS only" in the report.

## A sidebar click in the presenting tab ends the session

In the report: the Pacing coach, Q&A, the audience display, and analytics are the same session. Opening them keeps the data. The audience display follows the presenter's slide.

In the program: every address mounts a new page. In the tab that is presenting, a click on Pacing coach, Q&A, Audience display, Analytics, or Attention resets the timer, captions, pace, and teleprompter position.

Across two tabs, only these items sync: confirmed captions, interim captions, microphone on or off, WPM, and clear. The slide number, Q&A mode, and teleprompter position do not sync. When the presenter goes to the next slide, the audience tab does not follow.

What to capture: leave the presenting tab on the workspace. Open the audience display in a second tab beforehand. Set both screenshots to the same slide number yourself. Pace and captions can be captured across the two tabs.

## Pause does not stop listening

In the report: Paused holds the timer, the teleprompter, and the captions sent out.

In the program: pause stops the timer and Auto-scroll, because those require the session to be Live. Speech recognition does not stop. WPM can still update, and captions can still be sent to the audience tab.

What to capture: a still frame of the Paused status is enough. Do not show captions continuing to grow after pause.

## Notes cannot be downloaded after End

In the report: the audience display clears, and the presenter can still export this session's structured notes.

In the program: End presentation tells the audience tab to clear captions. The notes button is on the audience display, so a download after the clear is empty. Captions on the presenter tab remain only while that tab stays open. Opening Analytics drops them, and Analytics does not read them. The export is a `.txt` file.

What to capture: download the notes before End, from the tab that still has captions. In the report, still say the presenter exports them after the end.

## Entering Q&A cuts the session off

In the report: the button, the spoken command, and both hands enter Q&A inside the same session. Captions and pace are still there afterward.

In the program: all three paths open `/qa`. Changing the address mounts a new page, so the session returns to Ready. The five-minute timer does not start on a Live talk that was already running, and captions stored on the presenter tab are not carried over. The command matches only a final caption. The words it accepts are enter, start, or open, plus "q a," "q and a," or "questions."

What to capture: screenshot the Q&A screen on its own, with the timer and the buttons. Do not open it from a talk that already has a timer and captions and then photograph those as if they survived.

## Attention is a separate session and shows a sample by default

In the report: the camera facing the audience collects during this talk. Before the camera is on, the page says sensing has not started.

In the program: Attention has its own start and stop. It is not tied to **Start presentation**. If the Python service is off, or it is on but still on the Demo session, the page shows eight prepared audience cards and a sample curve. That layout can be mistaken for a live room. After Stop session, what remains belongs to the camera service's own session. Those results are not written into Session analytics.

The web page shows API labels that say `Student` as `Audience`. New labels from the camera service are already Audience 1. The database and the API paths still use the word students. That word is not on screen.

What to capture: the Demo session can show the layout. Do not describe a sample room as the audience of the talk you just gave. After **Start stream**, the picture is the camera's own session.

## Other limits

- Captions and commands are English `en-US` only, and they need Chrome.
- The slides are a fixed Finance Report. A presenter cannot upload a different deck.
- Presenter gestures, the macOS slide and laser program, and room attention each need a camera. One camera cannot run all of them at once.
- The Q&A recording stays in memory. A refresh drops it.
