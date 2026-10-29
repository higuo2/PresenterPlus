# PresenterPlus interaction guide

Use this when you write the report. Install steps are in [README.md](README.md). Where the running program differs, see [implementation-limits.md](implementation-limits.md). Leave those gaps out of the report.

**PresenterPlus: A Multimodal Interface for Live Lectures, Audience Captioning, and Session Review**

PresenterPlus is for a live talk in English. The presenter runs one session with speech, gesture, and clicks. The audience watches the slide and the live captions. After the talk, the presenter reviews pace and anonymous attention. The sample is a **Finance Report** of about fifteen minutes (10 slides).

The two users are the presenter and the audience. The audience is everyone in the room.

## Who looks at which surface

| Role | When | Surface |
| --- | --- | --- |
| Presenter | During the talk | Presenter workspace: current slide, three script lines, pace, Start / Pause / End |
| Presenter | When pace detail is needed | Pacing coach, still the same session |
| Presenter | Questions | Q&A session: timer, pause, add one minute, caption bookmarks |
| Audience | The whole talk | Audience display: slide, at most two caption lines, pace light at the bottom |
| Presenter | After the end | Session analytics |
| Presenter | Reviewing the room | Attention dashboard and Audience. Anonymous. Never projected |

The presenter looks at the room while speaking, so the main actions should not depend on hunting for the pointer. The audience display shows captions. It hides the teleprompter, the WPM number, and any camera. Presenter tools and the audience picture are separate surfaces. The slide, captions, and pace stay in sync. The controls stay with the presenter.

Moving between the presenter window and the audience window does not end the session. On the audience display, the slide, the captions, and the pace follow the presenter.

## One session

Session states:

**Ready → Live ⇄ Paused → Ended**

Q&A is a mode inside Live. It is the same session, so captions and pace are still there when the talk resumes.

1. **Ready.** The Finance Report is on slide 1. The teleprompter is still. There are no captions and no pace.
2. **Start presentation.** The session enters Live. The timer starts at zero. Captions and pace from the previous talk are cleared. The browser starts listening to English. YOU'RE HERE then follows the presenter's speech on the current slide.
3. **Speaking.** Confirmed English becomes the audience caption and moves YOU'RE HERE to the sentence just spoken. The last 8 seconds of words are used for pace. Slides move by button, arrow key, or a left or right wave. The audience display follows the slide.
4. **Paused.** The timer, the teleprompter, and the captions sent to the audience hold. Saved content remains. Resume returns to Live.
5. **Q&A.** Still this Live session. A five-minute timer starts. The teleprompter stays on the line it had when Q&A opened. Questions from the room are not matched to the script. **End Q&A**, or the spoken command "End Q&A," returns to the talk.
6. **End presentation.** Listening and gesture control stop. The audience display clears captions and ink. The presenter can still export this session's structured notes and open Session analytics.

## How the inputs divide the work

| Modality | What the presenter does | What it is for | Who sees the result |
| --- | --- | --- | --- |
| Speech | Speaks English into the microphone | Captions; teleprompter jumps to the matched sentence; pace from the last 8 seconds; commands only enter and leave Q&A | Audience sees captions. Presenter sees the current line, WPM, and the band |
| Click | Buttons, arrow keys, or a click on a line | Start, pause, end, slides, jump to a line, Q&A timer | Presenter workspace. The audience display follows the slide only |
| Gesture | Turns a camera on once, by hand | Enter Q&A, slides, laser, ink | Q&A surface, and the slide, laser, and ink on the audience display |
| Room camera | A second camera, facing the audience | Presence, facing direction, blinks, raised hands, phones. Anonymous labels only | Attention dashboard and Audience |

- Three equivalent ways into Q&A: the **Enter Q&A mode** button, the spoken command "Enter Q&A," and both hands held for about 0.8 seconds. A face or one hand does not trigger it. The gesture camera does not start when the page opens or when the presentation starts.
- A spoken command is handled as a command. It is not matched against the script.
- Pace: Slow is under 120, Optimal is 120-140, Fast is over 140. A pause in speech keeps the last valid pace. Silence is not Slow. The presenter sees the number. The audience sees only the light at the bottom.
- Presenter gestures use the camera facing the presenter. Room attention uses the camera facing the audience. The two cameras can both run in the same talk. With only one camera, choose one.

## Pages

| Page | Address | Role |
| --- | --- | --- |
| Presenter workspace | `/` | The presenter's main surface |
| Pacing coach | `/sensing` | Pace detail for the same session |
| Q&A session | `/qa` | Questions during the talk |
| Audience display | `/audience` | The dark picture projected to the room |
| Attention dashboard | `/attention` | Anonymous attention for the whole room |
| Audience | `/audience-members` | Each person's anonymous curve: Audience 1, Audience 2 |
| Session analytics | `/analytics` | Review after the end |

Audience is the presenter's view of the room. Audience display is the projection the room watches.

## Teleprompter

The screen shows the previous line, the current line, and the next line. The current line is marked **YOU'RE HERE**. After the talk starts and listening begins, confirmed English is matched to the script of the current slide. YOU'RE HERE jumps to the sentence just spoken. With no new confirmed sentence, it stays on the current line and does not move on its own. The presenter can click a visible line to move there. A new slide starts at that slide's first line and never uses another slide's lines.

## Pace

Only confirmed English captions are counted. The window is the last 8 seconds, refreshed every 2 seconds. The Pacing coach shows the current WPM, the band, the target range, the recent curve, session measures, one suggestion, and the current slide's tip. After a fast stretch returns to the target range, the curve keeps a peak mark.

The workspace shows a color band. The Pacing coach shows the number and the curve. The audience display shows only the light at the bottom.

## Q&A

Three entries, one result:

- **Enter Q&A mode**
- The caption command "Enter Q&A"
- Both hands held for about 0.8 seconds in the gesture camera

The Q&A session starts at five minutes. It can be paused, resumed, or extended by one minute. Confirmed captions can be bookmarked. When the browser allows it, a short recording stays in memory for playback after the talk. "End Q&A" or **End Q&A** returns to the talk, and this session's data remains. If the microphone or the recording is unavailable, the timer still runs.

## Gestures

The presenter turns the gesture camera on once. The same set of gestures enters Q&A and controls the projection. When the audience display is full screen and in front, slide changes, the laser, and ink appear on the picture the room sees.

| Gesture | Result |
| --- | --- |
| Both hands held about 0.8 seconds | Enter Q&A |
| Fist for about 0.3 seconds | Lock or unlock gesture control |
| Right-hand wave | Next slide |
| Left-hand wave | Previous slide |
| One finger | Ink |
| Two fingers | Laser |
| Three fingers | Undo the last stroke |
| Four or more fingers | Clear the marks |

While locked, an ordinary wave does not change slides. Both hands held still enter Q&A. Moving the pointer to the top-left corner stops the laser and the ink.

## Captions and the audience display

Listening is English (`en-US`). Interim results and confirmed results are separate. Each confirmed sentence keeps its time and its slide number. The audience display is dark. The slide is as large as possible, and captions are at most two lines. The light at the bottom shows pace only. The teleprompter, the WPM number, Q&A buttons, and any camera picture stay off this screen.

The presenter exports **structured session notes** after the end, grouped by slide and by time from this session's confirmed captions. After the end the audience display is empty, so the notes are not downloaded from the projection.

## Attention and review

The Attention dashboard shows the room: average attention, people present, phones, raised hands, blinks, duration, activity, and the trend. The Audience page shows each person: anonymous label, attention, last time seen, share of time facing forward, phone, raised hand, blinks, and that person's curve. Names are not stored.

Before the camera is on, the page says sensing has not started, rather than showing sample numbers as the current room. **Start stream** uses the camera facing the audience. After **Stop session**, that session can be opened again. People in the room consent before recording. The presenter uses this to review the talk. Do not use it to identify, score, or judge anyone.

Session analytics opens after **End presentation** and covers the talk that just finished: whether pace sat in 120-140, how long Q&A ran, and how anonymous attention was distributed. Pace and attention are two charts. Numbers while the talk is running stay on the Pacing coach.
