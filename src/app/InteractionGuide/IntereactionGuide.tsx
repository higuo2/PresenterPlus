import { useState } from "react"
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  Hand,
  HeartPulse,
  Lightbulb,
  Mic,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react"

const gestureGroups = [
  {
    title: "Canvas controls",
    subtitle: "Finger count",
    items: [
      {
        icon: "☝️",
        title: "1 Finger",
        tag: "Draw",
        text: "Draw directly on the slide.",
      },
      {
        icon: "✌️",
        title: "2 Fingers",
        tag: "Pointer",
        text: "Highlight a point on screen.",
      },
      {
        icon: "🤟",
        title: "3 Fingers",
        tag: "Undo",
        text: "Remove the last drawing stroke.",
      },
      {
        icon: "🖐️",
        title: "4 Fingers",
        tag: "Clear",
        text: "Erase all slide annotations.",
      },
      {
        icon: "✊",
        title: "Closed Fist",
        tag: "Lock / Unlock",
        text: "Hold for 1 second to prevent accidental gestures.",
      },
    ],
  },
  {
    title: "Slide navigation",
    subtitle: "Hand motion",
    items: [
      {
        icon: ArrowLeft,
        title: "Swipe Left",
        tag: "Next Slide",
        text: "Move to the next slide.",
      },
      {
        icon: ArrowRight,
        title: "Swipe Right",
        tag: "Previous Slide",
        text: "Return to the previous slide.",
      },
    ],
  },
]
const voices = [
  {
    commands: ['"Enter Q&A mode"', '"End Q&A"'],
    title: "Switch conversation modes",
    text: "Move seamlessly between your lecture and audience interaction.",
  },
  {
    commands: ['"Jump to slide [X]"'],
    title: "Go straight to your slide",
    text: "Navigate to a specific slide without reaching for your mouse.",
  },
  {
    commands: ['"Make teleprompter bigger"'],
    title: "Find your comfortable reading size",
    text: "Dynamically scale the font in your progressive teleprompter.",
  },
  {
    commands: ['"Zoom in"'],
    title: "Point first. Then speak.",
    text: "Pair with your index finger to zoom into an object. A simple object → action.",
  },
]
const cues = [
  {
    icon: HeartPulse,
    title: "Green glow & heartbeat",
    text: "A subtle peripheral glow and heartbeat earcon indicate an optimal speaking rate.",
    tag: "On track · 120–140 WPM",
    tone: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-700",
  },
  {
    icon: Zap,
    title: "Rose ambient flash",
    text: "A brief visual pulse brings your attention to a sudden increase in speaking pace.",
    tag: "Pace spike · ΔWPM ≥ 30",
    tone: "bg-rose-50 text-rose-700",
    dot: "bg-rose-700",
  },
  {
    icon: Sparkles,
    title: "Golden room lighting",
    text: "A warm lighting cue acknowledges positive audience reactions, like applause or laughter.",
    tag: "Audience response",
    tone: "bg-amber-50 text-amber-700",
    dot: "bg-amber-700",
  },
  {
    icon: AudioLines,
    title: "Soft blue lighting",
    text: "A gentle cue suggests a pause or a water break after a long monologue.",
    tag: "Take a breathing beat",
    tone: "bg-sky-100 text-sky-700",
    dot: "bg-sky-700",
  },
]

export default function InteractionGuide({ onClose }: { onClose: () => void }) {
  const [tester, setTester] = useState<"camera" | "test" | null>(null)
  const [complete, setComplete] = useState(false)
  const [commandNotice, setCommandNotice] = useState("")
  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command.replace(/"/g, ""))
      setCommandNotice(
        `Copied ${command}. Reference only; no live command was executed.`,
      )
    } catch {
      setCommandNotice(
        "Unable to access the clipboard. Select the command text to copy it manually.",
      )
    }
  }
  const openTester = (mode: "camera" | "test") => {
    setComplete(false)
    setTester(mode)
  }
  return (
    <div className="w-full max-w-[1500px] mx-auto px-8 py-6">
      <div className="mb-5 flex items-start justify-between gap-4 py-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            System capabilities
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Multimodal Interaction Guide
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Quick reference for touchless hand gestures, natural voice commands,
            and audio-visual telemetry cues.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close help"
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Hand size={21} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">01 / Movement</span>
          </div>
          <h2 className="mt-4 text-base font-semibold tracking-tight">
            Gestures & Spatial Pointer
          </h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            Finger count for drawing. Swipe for slides.
          </p>
          <div
            role="region"
            aria-label="MediaPipe gesture matrix"
            tabIndex={0}
            className="mt-5 mb-4 max-h-[400px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {gestureGroups.map((group) => (
              <div key={group.title} className="mb-5 last:mb-0">
                <div className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2">
                  <h3 className="text-xs font-semibold text-slate-700">
                    {group.title}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {group.subtitle}
                  </span>
                </div>
                <div>
                  {group.items.map(({ icon: Icon, title, text, tag }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-none"
                    >
                      {typeof Icon === "string" ? (
                        <span aria-hidden="true" className="shrink-0 text-base leading-6">{Icon}</span>
                      ) : (
                        <Icon aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-slate-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-800">
                            {title}
                          </h4>
                          <code className="shrink-0 rounded border border-slate-200/60 bg-slate-100 px-2 py-0.5 font-sans text-xs text-slate-700">
                            {tag}
                          </code>
                        </div>
                        <p className="mt-1 text-xs leading-6 text-slate-500">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <svg
              aria-hidden="true"
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="m16 8 6-3v14l-6-3" />
              <rect x={2} y={5} width={14} height={14} rx={2} />
            </svg>
            Keep your hands within the camera frame.
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Mic size={21} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">02 / Voice</span>
          </div>
          <h2 className="mt-4 text-base font-semibold tracking-tight">
            Voice Directives
          </h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            Say what you need. Stay in the moment.
          </p>
          <div className="mt-5">
            {voices.map(({ commands, title, text }) => (
              <div key={title} className="border-b border-slate-100 py-3 last:border-b-0">
                <h3 className="text-xs font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{text}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {commands.map((command) => (
                    <button
                      key={command}
                      type="button"
                      title="Copy voice command"
                      aria-label={`Copy voice command: ${command}`}
                      onClick={() => copyCommand(command)}
                      className="rounded border border-sky-100 bg-sky-100 px-2 py-1 text-xs text-sky-700 transition hover:bg-sky-100/70"
                    >
                      {command}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <Mic size={13} /> Speak naturally, with a short pause after.
          </div>
          {commandNotice && (
            <p role="status" className="mt-3 text-xs leading-6 text-sky-700">
              {commandNotice}
            </p>
          )}
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <AudioLines size={21} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">03 / Awareness</span>
          </div>
          <h2 className="mt-4 text-base font-semibold tracking-tight">
            Ambient Feedback & Earcons
          </h2>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            Small signals. A stronger connection.
          </p>
          <div className="mt-5">
            {cues.map(({ icon: Icon, title, text, tag, tone, dot }) => (
              <div key={title} className="border-b border-slate-100 py-3 last:border-b-0">
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className="shrink-0 text-slate-400" />
                  <h3 className="text-xs font-semibold text-slate-800">
                    {title}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-500">{text}</p>
                <span
                  className={`mt-2.5 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium ${tone}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {tag}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <Lightbulb size={13} /> Designed to guide, never to interrupt.
          </div>
        </section>
      </div>

      <section className="flex w-full flex-col items-start justify-between gap-5 rounded-xl border border-sky-100 bg-sky-100/40 p-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="hidden h-12 w-12 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-700 sm:flex">
            <ScanLine size={24} />
          </span>
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Live Camera & Microphone Pre-Flight Check
              </h2>
              <span className="rounded border border-sky-100 bg-white px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-sky-700">
                Demo
              </span>
            </div>
            <p className="max-w-lg text-xs leading-6 text-slate-500">
              Test gesture responsiveness and voice command latency before
              starting your presentation.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <button
            onClick={() => openTester("camera")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Calibrate Camera
          </button>
          <button
            onClick={() => openTester("test")}
            className="flex items-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-700/80"
          >
            Run Pre-Flight Test <ArrowUpRight size={14} />
          </button>
        </div>
      </section>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} /> Private by design. Your camera and
          microphone stay in your control.
        </span>
        <span>
          Preview capabilities · Gesture, voice and ambient feedback are
          simulated.
        </span>
      </div>

      {tester && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-5 backdrop-blur-sm"
          onClick={() => setTester(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setTester(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tester-title"
            className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 id="tester-title" className="text-base font-semibold">
                {tester === "camera"
                  ? "Camera calibration"
                  : "Pre-flight check"}
              </h2>
              <button
                autoFocus
                aria-label="Close pre-flight check"
                onClick={() => setTester(null)}
                className="rounded p-1 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-500">
              Simulated preview only. This test does not request device access
              or measure real responsiveness or latency.
            </p>
            <div className="my-5 space-y-3 rounded-lg bg-slate-50 p-4">
              {(tester === "camera"
                ? [
                    "Position your camera at eye level",
                    "Keep your hands and upper body in frame",
                    "Use even, front-facing lighting",
                  ]
                : [
                    "Camera framing",
                    "Gesture recognition",
                    "Microphone & voice commands",
                    "Ambient feedback",
                  ]
              ).map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  {complete ? (
                    <Check size={15} className="text-emerald-700" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                  {label}
                  {complete && (
                    <span className="ml-auto text-xs text-slate-400">Demo</span>
                  )}
                </div>
              ))}
            </div>
            {complete && (
              <p role="status" className="mb-4 text-xs text-emerald-700">
                Demo complete. Real hardware calibration is not connected yet.
              </p>
            )}
            <button
              onClick={() => (complete ? setTester(null) : setComplete(true))}
              className="w-full rounded-lg bg-sky-700 py-2.5 text-xs font-semibold text-white hover:bg-sky-700/80"
            >
              {complete ? "Done" : "Run simulated check"}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
