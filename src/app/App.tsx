import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  useLocation,
} from "react-router"
import {
  Activity,
  AlertCircle,
  Menu,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BatteryFull,
  Bell,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Expand,
  FileText,
  Hand,
  Layers,
  LayoutDashboard,
  Maximize2,
  Mic,
  MoreHorizontal,
  MousePointer2,
  Pause,
  Play,
  Radio,
  QrCode,
  Settings2,
  Share2,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Volume2,
  X,
} from "lucide-react"

const cn = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ")
const slides = [
  "A new way to present",
  "The human connection",
  "System architecture",
  "Designed for flow",
  "Multimodal interaction",
  "The feedback loop",
  "Looking ahead",
  "Reading the room",
  "Hands-free control",
  "Captions for all",
  "Notes, automatically",
  "After the talk",
]
const notes = [
  {
    before: "There is ",
    highlight: "a new way to present",
    after: ".",
  },
  {
    before: "What matters is ",
    highlight: "the human connection",
    after: ".",
  },
  {
    before: "Voice, gesture, and feedback share one ",
    highlight: "system",
    after: ".",
  },
  {
    before: "The pace should feel ",
    highlight: "designed for flow",
    after: ".",
  },
  {
    before: "Point, speak, and ",
    highlight: "the slide responds",
    after: ".",
  },
  {
    before: "The room answers through ",
    highlight: "a feedback loop",
    after: ".",
  },
  {
    before: "The next sessions get ",
    highlight: "easier",
    after: ".",
  },
  {
    before: "Applause and silence tell you ",
    highlight: "how the room feels",
    after: ".",
  },
  {
    before: "A swipe or a fist replaces ",
    highlight: "the clicker",
    after: ".",
  },
  {
    before: "People far away can still ",
    highlight: "read every line",
    after: ".",
  },
  {
    before: "The notes are ready ",
    highlight: "before anyone asks",
    after: ".",
  },
  {
    before: "After the talk, the ",
    highlight: "pattern is visible",
    after: ".",
  },
]
const line = (note: (typeof notes)[number]) =>
  `${note.before}${note.highlight}${note.after}`
const script = [
  "When technology gets out of the way, we can focus on what really matters.",
  "Great presentations aren't just about sharing information. They're about creating a connection.",
  "Our multimodal approach brings voice, gesture, and real-time feedback into one seamless experience.",
  "You stay in your flow. The system takes care of the rest.",
  "Watch the room. Applause means keep going. A long silence means give them a moment.",
  "A swipe moves the slide. A closed fist pauses. Point, then say zoom in.",
  "People at the back can read the line you are speaking, highlighted as you say it.",
  "Open both arms when the questions start. The script steps aside.",
  "Say end Q and A when the conversation is finished, and the lecture comes back.",
  "The notes are already arranged by slide. Nobody had to type them in the dark.",
  "When the talk ends, the pattern is still there: pace, pauses, and the questions they asked.",
]
function playHeartbeat() {
  const ctx = new AudioContext()
  const thump = (when: number, freq: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.001, when)
    gain.gain.exponentialRampToValueAtTime(0.5, when + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.14)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(when)
    osc.stop(when + 0.15)
  }
  const now = ctx.currentTime
  thump(now, 72)
  thump(now + 0.2, 54)
  setTimeout(() => ctx.close(), 800)
}
function Wave({
  color = "bg-sky-600",
  small = false,
}: {
  color?: string
  small?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[3px]",
        small ? "h-5" : "h-8",
      )}
    >
      {[3, 7, 12, 5, 18, 25, 15, 8, 20, 28, 12, 19, 8, 4, 11, 5].map(
        (height, index) => (
          <span
            key={index}
            className={cn(
              "w-[3px] rounded-full",
              color,
              small ? "max-h-5" : "",
            )}
            style={{ height }}
          />
        ),
      )}
    </div>
  )
}
function Slide({
  number = 4,
  compact = false,
}: {
  number?: number
  compact?: boolean
}) {
  const title = slides[number - 1] || "The next chapter"
  const note = notes[number - 1]
  const index = String(number).padStart(2, "0")
  const heading = cn(
    "font-semibold leading-[1.12] tracking-[-0.02em]",
    compact ? "text-[8px]" : "text-[clamp(20px,2.1vw,34px)]",
  )
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden bg-white text-[#182136]",
        compact ? "p-1.5" : "px-[5%] py-[3.5%]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 font-semibold text-slate-500",
          compact ? "text-[4px]" : "text-[11px]",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-sm bg-indigo-500" />
        FORM & FUNCTION
        <span className="ml-auto font-normal tracking-[0.12em]">
          DESIGN SYSTEM KEYNOTE
        </span>
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          compact ? "pt-1" : "pt-4",
        )}
      >
        {number === 1 && (
          <div className="flex flex-1 flex-col justify-center">
            <p
              className={cn(
                "font-medium uppercase tracking-[0.16em] text-indigo-600",
                compact ? "text-[4px]" : "text-[11px]",
              )}
            >
              01 / Opening
            </p>
            <h2 className={cn(heading, "mt-2 max-w-[16ch]")}>{title}</h2>
            {!compact && (
              <p className="mt-4 max-w-[36ch] text-sm leading-6 text-slate-500">
                {line(note)}
              </p>
            )}
          </div>
        )}
        {number === 2 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div
              className={cn(
                "mt-3 grid flex-1 grid-cols-2",
                compact ? "gap-1" : "mt-5 gap-4",
              )}
            >
              {[
                ["In the room", "Eye contact stays with the audience."],
                ["On the slide", "One idea, large enough to read."],
              ].map(([label, copy]) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-lg bg-slate-50",
                    compact ? "p-1" : "p-4",
                  )}
                >
                  <p
                    className={cn(
                      "font-semibold text-indigo-700",
                      compact ? "text-[5px]" : "text-sm",
                    )}
                  >
                    {label}
                  </p>
                  {!compact && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {copy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {number === 3 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div
              className={cn(
                "mt-auto flex items-center",
                compact ? "gap-0.5" : "gap-2",
              )}
            >
              {["Voice", "Gesture", "Slide", "Room"].map((step, stepIndex) => (
                <div
                  key={step}
                  className="flex min-w-0 flex-1 items-center gap-1"
                >
                  <div
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-md bg-indigo-50 font-medium text-indigo-800",
                      compact ? "h-4 text-[4px]" : "h-16 text-sm",
                    )}
                  >
                    {step}
                  </div>
                  {stepIndex < 3 && (
                    <span
                      className={cn(
                        "text-slate-300",
                        compact ? "text-[5px]" : "text-lg",
                      )}
                    >
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {number === 4 && (
          <div className="flex min-h-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <h2 className={heading}>
                Designed for flow
                <br />
                <span className="text-[#6862b1]">Not for friction.</span>
              </h2>
              {!compact && (
                <p className="mt-4 max-w-[28ch] text-sm leading-6 text-slate-500">
                  {line(note)}
                </p>
              )}
            </div>
            <div className={cn("flex", compact ? "gap-0.5" : "gap-2")}>
              {[
                [Mic, "Voice", "bg-[#e1e0f5]", "text-[#6860ac]"],
                [Hand, "Gesture", "bg-[#dbeef0]", "text-[#43848d]"],
                [Activity, "Feedback", "bg-[#e4e8f2]", "text-[#64789b]"],
              ].map(([Icon, label, bg, color]) => (
                <div
                  key={label as string}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl",
                    bg as string,
                    color as string,
                    compact ? "h-6 w-4" : "h-24 w-16",
                  )}
                >
                  <Icon className={compact ? "h-2 w-2" : "h-6 w-6"} />
                  {!compact && (
                    <span className="mt-2 text-[10px] font-medium">
                      {label as string}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {number === 5 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div
              className={cn(
                "mt-auto flex items-end",
                compact ? "h-6 gap-1" : "h-28 gap-3",
              )}
            >
              {[
                ["Voice", 70],
                ["Gesture", 45],
                ["Gaze", 88],
                ["Clicker", 20],
              ].map(([label, amount]) => (
                <div
                  key={label as string}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div
                    className="rounded-t bg-indigo-500"
                    style={{ height: `${amount}%` }}
                  />
                  {!compact && (
                    <span className="mt-1 text-center text-[10px] text-slate-500">
                      {label as string}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {number === 6 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <svg
              viewBox="0 0 240 80"
              className={cn("mt-auto w-full", compact ? "h-6" : "h-24")}
              aria-hidden="true"
            >
              <path
                d="M0 58 C30 58 40 20 70 22 C100 24 110 64 140 50 C170 36 190 18 240 14"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
              />
              <path
                d="M0 58 C30 58 40 20 70 22 C100 24 110 64 140 50 C170 36 190 18 240 14 V80 H0 Z"
                fill="#e0e7ff"
              />
            </svg>
          </div>
        )}
        {number === 7 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div className={cn("mt-auto", compact ? "space-y-0.5" : "space-y-2")}>
              {["This talk", "The questions", "The next session"].map(
                (item, itemIndex) => (
                  <div key={item} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full bg-indigo-600",
                        compact ? "h-1 w-1" : "h-2 w-2",
                      )}
                    />
                    <span
                      className={cn(
                        "text-slate-600",
                        compact ? "text-[5px]" : "text-sm",
                      )}
                    >
                      {compact ? item : `0${itemIndex + 1}  ${item}`}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
        {number === 8 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div
              className={cn(
                "mt-auto grid grid-cols-3",
                compact ? "gap-1" : "gap-3",
              )}
            >
              {[
                ["92%", "Engaged"],
                ["135", "WPM"],
                ["4", "Fillers"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg bg-slate-50 text-center">
                  <p
                    className={cn(
                      "font-semibold text-indigo-700",
                      compact ? "text-[7px]" : "py-3 text-2xl",
                    )}
                  >
                    {value}
                  </p>
                  {!compact && (
                    <p className="pb-3 text-[11px] text-slate-500">{label}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {number === 9 && (
          <div className="flex min-h-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <h2 className={heading}>{title}</h2>
              {!compact && (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {line(note)}
                </p>
              )}
            </div>
            <svg
              viewBox="0 0 120 80"
              className={cn("shrink-0", compact ? "h-6 w-8" : "h-24 w-36")}
              aria-hidden="true"
            >
              <rect width="120" height="80" rx="6" fill="#eef2ff" />
              <rect x="18" y="14" width="46" height="28" rx="2" fill="#c7d2fe" />
              <circle cx="28" cy="58" r="6" fill="#6366f1" />
              <rect x="36" y="54" width="10" height="14" rx="2" fill="#4338ca" />
              <circle cx="70" cy="60" r="4" fill="#94a3b8" />
              <circle cx="84" cy="60" r="4" fill="#94a3b8" />
              <circle cx="98" cy="60" r="4" fill="#94a3b8" />
            </svg>
          </div>
        )}
        {number === 10 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div
              className={cn(
                "mt-auto rounded-md bg-slate-900 text-white",
                compact ? "px-1 py-0.5 text-[4px]" : "px-4 py-3 text-sm",
              )}
            >
              People at the back can{" "}
              <span className="rounded bg-yellow-300 px-1 text-slate-900">
                read every line
              </span>
            </div>
          </div>
        )}
        {number === 11 && (
          <div className="flex min-h-0 flex-1 flex-col">
            <h2 className={heading}>{title}</h2>
            <div className={cn("mt-auto", compact ? "space-y-0.5" : "space-y-2")}>
              {["Slide title", "The sentence you just said", "One thing to remember"].map(
                (row) => (
                  <div
                    key={row}
                    className={cn(
                      "flex items-center gap-2 border-b border-slate-100 text-slate-500",
                      compact ? "text-[4px]" : "pb-1 text-sm",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-sm bg-indigo-400" />
                    {row}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
        {number === 12 && (
          <div className="flex flex-1 flex-col justify-center">
            <p
              className={cn(
                "font-medium uppercase tracking-[0.16em] text-indigo-600",
                compact ? "text-[4px]" : "text-[11px]",
              )}
            >
              12 / Close
            </p>
            <h2 className={cn(heading, "mt-2")}>{title}</h2>
            {!compact && (
              <p className="mt-4 max-w-[36ch] text-sm leading-6 text-slate-500">
                {line(note)}
              </p>
            )}
          </div>
        )}
      </div>
      <div
        className={cn(
          "mt-2 flex justify-between border-t border-slate-200 text-slate-400",
          compact ? "pt-0.5 text-[3px]" : "pt-3 text-[10px]",
        )}
      >
        <span>Human first. Technology second.</span>
        <span>
          PresenterPlus 2025 <span className="ml-3">{index}</span>
        </span>
      </div>
    </div>
  )
}
const paceSamples = [
  128, 130, 133, 132, 136, 140, 138, 144, 136, 148, 158, 170, 185, 152, 140, 134,
]
const paceY = (wpm: number) => 64 - ((wpm - 100) / 100) * 56
const pacePath = paceSamples
  .map((wpm, index) => {
    const x = (index / (paceSamples.length - 1)) * 640
    return `${index ? "L" : "M"}${x.toFixed(1)},${paceY(wpm).toFixed(1)}`
  })
  .join(" ")
function AcousticTimeline() {
  return (
    <div className="shrink-0 rounded-xl border border-border bg-white px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Session acoustic & pacing timeline
        </span>
        <span className="font-mono text-[10px] text-slate-400">WPM 100–200</span>
      </div>
      <div className="relative h-16">
        <svg
          viewBox="0 0 640 64"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <rect
            x="0"
            y={paceY(160)}
            width="640"
            height={paceY(140) - paceY(160)}
            fill="#FEF3C7"
          />
          <rect
            x="0"
            y={paceY(140)}
            width="640"
            height={paceY(120) - paceY(140)}
            fill="#D1FAE5"
          />
          <path
            d={pacePath}
            fill="none"
            stroke="#0F172A"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="512" cy={paceY(185)} r="3.5" fill="#BE123C" />
        </svg>
        {[
          ["34%", "Silence (3s)"],
          ["58%", "Laughter"],
          ["78%", "Applause (+12dB)"],
        ].map(([left, label]) => (
          <span
            key={label}
            style={{ left }}
            className="absolute top-0 -translate-x-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-600"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
        <span>00:00</span>
        <span>05:00</span>
        <span>10:00</span>
        <span>15:00</span>
      </div>
    </div>
  )
}
function AudiencePulse({ slide }: { slide: number }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">
          AUDIENCE PULSE & CO-PILOT
        </h2>
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col space-y-6 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            <Volume2 size={12} /> Room energy
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[32px] font-bold leading-none text-slate-900">
              88%
            </span>
            <span className="mb-1 text-xs text-emerald-700">+4% vs avg</span>
          </div>
          <ul className="mt-2 space-y-2 text-xs text-slate-600">
            {[
              ["12:52:10", "Applause detected", "+14dB"],
              ["12:50:45", "Laughter response", "Positive"],
              ["12:48:20", "Room quiet", "High focus"],
            ].map(([stamp, event, level]) => (
              <li key={stamp} className="flex items-baseline gap-2 py-1.5">
                <span className="font-mono text-[10px] text-slate-400">
                  {stamp}
                </span>
                <span>{event}</span>
                <span className="ml-auto font-mono text-[10px] text-slate-500">
                  {level}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            <Mic size={12} /> Vocal & delivery
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["185", "WPM (Fast)", "text-rose-700"],
              ["4", "Um / Ah", "text-slate-800"],
              ["82%", "Eye Contact", "text-slate-800"],
            ].map(([value, label, color]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className={cn("text-[20px] font-semibold leading-none", color)}>
                  {value}
                </div>
                <div className="mt-1.5 text-[10px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] text-slate-500">
              <Sliders size={11} /> Voice pitch stability
            </div>
            <div className="flex h-6 items-end gap-[3px]">
              {[8, 14, 20, 12, 22, 18, 10, 16, 24, 14, 9, 18, 12, 20, 8].map(
                (height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-sm bg-sky-500/80"
                    style={{ height }}
                  />
                ),
              )}
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium leading-relaxed text-amber-900">
            <Sparkles size={14} /> Live presentation coaching
          </div>
          <ul className="space-y-2 text-[13px] font-medium leading-relaxed text-amber-900">
            <li>
              Pacing spiked to 185 WPM on Slide {slide}. Take a brief pause
              before moving to the diagram.
            </li>
            <li>
              Sustained audience applause detected. Allow 2 seconds before
              continuing.
            </li>
          </ul>
        </section>
      </div>
    </section>
  )
}
function AppShell() {
  const path = useLocation().pathname
  const view = path === "/" ? "presenter" : path.slice(1)
  const stage = view === "qa" || view === "audience"
  const [slide, setSlide] = useState(4)
  const [paragraph, setParagraph] = useState(1)
  const [paused, setPaused] = useState(false)
  const [mic, setMic] = useState(true)
  const [laser, setLaser] = useState(true)
  const [settings, setSettings] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [preferredSidebarWidth, setPreferredSidebarWidth] = useState(() => {
    try {
      const savedWidth = Number(
        localStorage.getItem("presenterplus-sidebar-width"),
      )
      return Number.isFinite(savedWidth) && savedWidth >= 224
        ? Math.min(400, savedWidth)
        : 256
    } catch {
      return 256
    }
  })
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [resizingSidebar, setResizingSidebar] = useState(false)
  const [preferredTeleprompterWidth, setPreferredTeleprompterWidth] =
    useState(300)
  const [resizingSplit, setResizingSplit] = useState(false)
  const [analyticsRail, setAnalyticsRail] = useState(36)
  const [resizingAnalytics, setResizingAnalytics] = useState(false)
  const maxSidebarWidth = Math.max(224, Math.min(400, viewportWidth - 720))
  const sidebarWidth = Math.min(preferredSidebarWidth, maxSidebarWidth)
  const maxTeleprompterWidth = Math.max(
    240,
    Math.min(520, viewportWidth - sidebarWidth - 420),
  )
  const teleprompterWidth = Math.min(
    preferredTeleprompterWidth,
    maxTeleprompterWidth,
  )
  const sidebarTier = sidebarWidth >= 340 ? 2 : sidebarWidth >= 272 ? 1 : 0
  const navText = ["text-xs", "text-sm", "text-[15px]"][sidebarTier]
  const labelText = ["text-[9px]", "text-[11px]", "text-xs"][sidebarTier]
  const titleText = ["text-xs", "text-sm", "text-[15px]"][sidebarTier]
  const metaText = ["text-[10px]", "text-xs", "text-[13px]"][sidebarTier]
  const iconSize = [17, 18, 20][sidebarTier]
  const resizeSidebar = (width: number) =>
    setPreferredSidebarWidth(
      Math.round(Math.max(224, Math.min(maxSidebarWidth, width))),
    )
  const resizeTeleprompter = (width: number) =>
    setPreferredTeleprompterWidth(
      Math.round(Math.max(240, Math.min(maxTeleprompterWidth, width))),
    )
  const resizeAnalyticsRail = (percent: number) =>
    setAnalyticsRail(Math.round(Math.max(26, Math.min(58, percent))))
  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(
        "presenterplus-sidebar-width",
        String(preferredSidebarWidth),
      )
    } catch {}
  }, [preferredSidebarWidth])
  const [notice, setNotice] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [qaSeconds, setQaSeconds] = useState(299)
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [pace, setPace] = useState<"optimal" | "fast" | "slow">("optimal")
  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused) setSeconds((value) => value + 1)
      if (view === "qa" && !paused)
        setQaSeconds((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [paused, view])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.target instanceof HTMLInputElement) return
      if (event.key === "ArrowRight")
        setSlide((value) => Math.min(slides.length, value + 1))
      if (event.key === "ArrowLeft") setSlide((value) => Math.max(1, value - 1))
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])
  const time = (value: number) =>
    `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`
  const download = () => {
    const blob = new Blob(
      [
        `PresenterPlus — Design System Keynote\n\n${slides
          .map((title, index) => {
            const note = notes[index]
            return `Slide ${String(index + 1).padStart(2, "0")} — ${title}\n${line(note)}`
          })
          .join("\n\n")}\n\nKey takeaways\nTechnology should amplify your presence.\nVoice, gesture and real-time feedback work together.\n\nPerformance\nAverage pace: 135 WPM\nEngagement: 92%\nFiller words: 4`,
      ],
      { type: "text/plain" },
    )
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "PresenterPlus-session-notes.txt"
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice("Session notes exported")
  }
  return (
    <div
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
      className={cn(
        "flex h-dvh flex-col overflow-hidden bg-background text-foreground",
        (resizingSidebar || resizingSplit || resizingAnalytics) &&
          "cursor-col-resize select-none",
      )}
    >
      <header className="relative z-30 flex h-16 shrink-0 items-center border-b border-border bg-white">
        <div className="flex h-full shrink-0 items-center gap-2 px-5 lg:w-[var(--sidebar-width)]">
          <button
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-slate-600 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <AudioLines size={18} />
            </span>
            <span className="text-[19px] font-semibold tracking-[-0.4px]">
              Presenter<span className="text-sky-700">Plus</span>
            </span>
          </NavLink>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4">
          <h1 className="truncate text-[15px] font-semibold text-slate-800">
            {view === "analytics"
              ? "Presentation Performance Report"
              : "Design System Keynote"}
          </h1>
          <div className="flex shrink-0 items-center gap-3">
            {view === "analytics" ? (
              <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 md:inline">
                Completed Oct 7, 2026 (24 mins)
              </span>
            ) : (
              <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Live{" "}
                <span className="font-mono">{time(754 + seconds)}</span>
              </span>
            )}
            {view !== "analytics" && (
            <button
              onClick={() =>
                window.open("/audience", "_blank", "noopener,noreferrer")
              }
              className="hidden items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600 sm:flex"
            >
              <Expand size={14} /> Audience display
            </button>
            )}
            <button
              aria-label="Session settings"
              onClick={() => setSettings(true)}
              className="text-slate-500 hover:text-sky-700"
            >
              <Settings2 size={18} />
            </button>
            <button
              aria-label="Notifications"
              onClick={() =>
                setNotice("All systems connected. You're all caught up.")
              }
              className="hidden text-slate-500 sm:block"
            >
              <Bell size={17} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-[11px] font-semibold text-sky-800">
              AL
            </span>
          </div>
        </div>
      </header>
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-slate-900/25 lg:hidden"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed bottom-0 left-0 top-16 z-40 w-[min(var(--sidebar-width),90vw)] shrink-0 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_svg]:shrink-0 border-r border-border bg-white py-4 transition-transform lg:translate-x-0",
          stage ? "hidden" : "flex",
          sidebarTier === 2 ? "px-6" : "px-5",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <span
            className={cn(
              "mb-2 block font-semibold uppercase tracking-[0.14em] text-slate-500",
              labelText,
            )}
          >
            Current presentation
          </span>
          <p className={cn("font-semibold text-slate-800", titleText)}>
            Design System Keynote
          </p>
          <div
            className={cn(
              "mt-3 flex items-center gap-1.5 text-slate-500",
              metaText,
            )}
          >
            {view === "analytics" ? (
              <>
                Completed session
                <span className="ml-auto">24 mins</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" /> Live
                session{" "}
                <span className="ml-auto font-mono">{time(754 + seconds)}</span>
              </>
            )}
          </div>
        </div>
        <p
          className={cn(
            "mb-3 px-3 font-semibold uppercase tracking-[0.16em] text-slate-500",
            labelText,
          )}
        >
          Presentation tools
        </p>
        <nav className="space-y-1">
          {[
            { path: "/", name: "Presenter workspace", icon: Layers },
            { path: "/sensing", name: "Audience sensing", icon: Activity },
            { path: "/qa", name: "Q&A session", icon: Mic },
            { path: "/audience", name: "Audience display", icon: Expand },
          ].map(({ path: href, name, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium whitespace-nowrap transition-colors",
                  navText,
                  isActive
                    ? "bg-sky-50 text-sky-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )
              }
            >
              <Icon size={iconSize} />
              {name}
            </NavLink>
          ))}
        </nav>
        <p
          className={cn(
            "mb-2 mt-5 px-3 font-semibold uppercase tracking-[0.16em] text-slate-500",
            labelText,
          )}
        >
          Post-presentation
        </p>
        <NavLink
          to="/analytics"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 font-medium",
              navText,
              isActive
                ? "bg-sky-50 text-sky-800"
                : "text-slate-600 hover:bg-slate-50",
            )
          }
        >
          <LayoutDashboard size={iconSize} /> Session analytics
        </NavLink>
        <div className="mt-auto pt-4">
          <button
            onClick={() => {
              setSettings(true)
              setSidebarOpen(false)
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-slate-600 hover:bg-slate-50",
              navText,
            )}
          >
            <Settings2 size={iconSize} /> Session settings
          </button>
          <button
            onClick={() =>
              setNotice(
                "Use arrow keys to navigate slides. Open session settings to manage voice and laser controls.",
              )
            }
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-slate-600 hover:bg-slate-50",
              navText,
            )}
          >
            <CircleHelp size={iconSize} /> Help & shortcuts
          </button>
          <div className="mt-4 border-t border-slate-100 px-3 pt-5">
            <span
              className={cn(
                "flex items-center gap-2 text-slate-500",
                metaText,
              )}
            >
              <ShieldCheck size={iconSize - 3} /> Private by design
            </span>
            <p className={cn("mt-2 leading-snug text-slate-500", metaText)}>
              Your focus belongs on the room.
              <br />
              We've got the details.
            </p>
          </div>
        </div>
      </aside>
      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuemin={224}
        aria-valuemax={maxSidebarWidth}
        aria-valuenow={sidebarWidth}
        aria-valuetext={`${sidebarWidth} pixels`}
        aria-describedby="sidebar-resize-help"
        tabIndex={0}
        title="Drag to resize Double-click to reset"
        className={cn(
          "group fixed bottom-0 left-[calc(var(--sidebar-width)-4px)] top-16 z-50 hidden w-2 touch-none cursor-col-resize items-center justify-center outline-none focus-visible:bg-sky-100",
          !stage && "lg:flex",
          resizingSidebar && "bg-sky-100/70",
        )}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.preventDefault()
          event.currentTarget.focus()
          event.currentTarget.setPointerCapture(event.pointerId)
          setResizingSidebar(true)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            resizeSidebar(event.clientX)
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)
          setResizingSidebar(false)
        }}
        onPointerCancel={() => setResizingSidebar(false)}
        onLostPointerCapture={() => setResizingSidebar(false)}
        onDoubleClick={() => setPreferredSidebarWidth(256)}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return
          event.preventDefault()
          event.stopPropagation()
          const step = event.shiftKey ? 24 : 8
          resizeSidebar(
            event.key === "Home"
              ? 224
              : event.key === "End"
                ? maxSidebarWidth
                : sidebarWidth + (event.key === "ArrowRight" ? step : -step),
          )
        }}
      >
        <span
          className={cn(
            "h-10 w-[3px] rounded-full bg-slate-300 transition-colors group-hover:bg-sky-600 group-focus-visible:bg-sky-600",
            resizingSidebar && "bg-sky-600",
          )}
        />
      </div>
      <span id="sidebar-resize-help" className="sr-only">
        Drag to resize. Use left and right arrow keys, or Home and End.
        Double-click to reset.
      </span>
      <main
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-y-auto",
          !stage && "lg:ml-[var(--sidebar-width)]",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1680px] flex-col gap-2.5 px-4 py-3 xl:px-5",
            view === "analytics"
              ? "h-full min-h-0 overflow-hidden"
              : "min-h-full lg:h-full lg:min-h-0",
          )}
        >
          {(view === "presenter" || view === "sensing") && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)] px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />{" "}
                  LECTURE MODE
                </span>
                <span className="h-4 border-l border-border" />
                <span className="text-xs text-slate-500">
                  Slide{" "}
                  <b className="font-mono font-medium text-slate-900">
                    {String(slide).padStart(2, "0")}
                  </b>
                  <span className="text-slate-500"> / {slides.length}</span>
                </span>
              </div>
              <button
                onClick={() => setMic(!mic)}
                className="flex items-center gap-3"
              >
                <Wave small color={mic ? "bg-sky-600" : "bg-slate-300"} />
                <span className="text-xs text-slate-600">
                  {mic ? "Mic active" : "Mic muted"}
                </span>
              </button>
              <button
                onClick={() =>
                  setPace(
                    pace === "optimal"
                      ? "fast"
                      : pace === "fast"
                        ? "slow"
                        : "optimal",
                  )
                }
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-[10px]",
                  pace === "fast"
                    ? "bg-amber-50 text-amber-800"
                    : pace === "slow"
                      ? "bg-sky-50 text-sky-800"
                      : "bg-green-50 text-green-700",
                )}
              >
                {pace === "fast"
                  ? "185 WPM too fast"
                  : pace === "slow"
                    ? "95 WPM too slow"
                    : "132 WPM optimal"}
              </button>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />{" "}
                  Vision active
                </span>
                <BatteryFull size={18} />
                <span className="font-mono text-xs">14:32</span>
              </div>
            </div>
          )}
          {(view === "presenter" || view === "sensing") && (
            <>
              {pace === "optimal" && (
                <div
                  role="status"
                  className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 font-medium text-green-800">
                    <Activity size={15} /> You're in a great rhythm
                  </span>
                  <span className="text-slate-600">
                    Your pace is clear, comfortable, and easy to follow.
                  </span>
                </div>
              )}
              {pace === "fast" && (
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-amber-800">
                    <Activity size={15} /> Speaking rate too fast 185 WPM
                  </span>
                  <button
                    onClick={playHeartbeat}
                    className="rounded-md bg-white px-2 py-1 font-medium text-amber-900"
                  >
                    Play heartbeat
                  </button>
                  <span className="text-slate-600">
                    Take a breath, find your rhythm.
                  </span>
                </div>
              )}
              {pace === "slow" && (
                <div
                  role="status"
                  className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 font-medium text-sky-800">
                    <Activity size={15} /> Pace is a little low 95 WPM
                  </span>
                  <span className="text-slate-600">
                    Bring the energy up so the room stays with you.
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "grid min-h-0 flex-1 gap-3 lg:gap-0 lg:grid-cols-[minmax(0,1fr)_12px_var(--teleprompter-width)]",
                )}
                style={
                  {
                    "--teleprompter-width": `${teleprompterWidth}px`,
                  } as CSSProperties
                }
              >
                <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
                  <div className="relative flex min-h-[240px] flex-1 items-center justify-center overflow-hidden bg-slate-50 [container-type:size] lg:min-h-0">
                    <div
                      className={cn(
                        "relative aspect-video w-[min(100cqw,177.777777cqh)] max-w-full shrink-0 overflow-hidden bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-4 ring-inset",
                        pace === "fast"
                          ? "ring-amber-400"
                          : pace === "slow"
                            ? "ring-sky-400"
                            : "ring-green-500",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full transition-transform duration-500",
                          zoom && "scale-125",
                        )}
                      >
                        <Slide number={slide} />
                      </div>
                      {laser && (
                        <button
                          aria-label="Zoom targeted diagram"
                          onClick={() => setZoom(!zoom)}
                          className="absolute right-[24%] top-[63%] flex flex-col items-start"
                        >
                          <span className="relative h-5 w-5 rounded-full border border-sky-600/40 bg-sky-100 shadow-[0_0_20px_#0284c733]">
                            <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sky-600" />
                          </span>
                          <span className="ml-4 mt-2 flex items-center gap-2 rounded-md border border-sky-200 bg-white/95 px-2.5 py-2 text-[10px] text-sky-700">
                            <MousePointer2 size={11} /> Point + voice{" "}
                            <span className="border-l border-slate-200 pl-2 text-slate-900">
                              {zoom ? "Reset view" : "Zoom diagram"}
                            </span>
                          </span>
                        </button>
                      )}
                      <button
                        aria-label="Fullscreen slide"
                        onClick={() => {
                          const element = document.getElementById("root")
                          if (document.fullscreenElement)
                            document.exitFullscreen()
                          else element?.requestFullscreen?.()
                        }}
                        className="absolute right-3 top-3 rounded-md bg-white/70 p-2 text-slate-500"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-3 py-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />{" "}
                      Presenting to audience{" "}
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
                        1920 × 1080
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Previous slide"
                        disabled={slide === 1}
                        onClick={() => setSlide(slide - 1)}
                        className="text-slate-500 disabled:opacity-30"
                      >
                        <ChevronLeft size={17} />
                      </button>
                      <span className="font-mono text-[11px] text-slate-500">
                        {String(slide).padStart(2, "0")} / {slides.length}
                      </span>
                      <button
                        aria-label="Next slide"
                        disabled={slide === slides.length}
                        onClick={() => setSlide(slide + 1)}
                        className="text-slate-500 disabled:opacity-30"
                      >
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                </section>
                <div
                  role="separator"
                  aria-label="Resize teleprompter"
                  aria-orientation="vertical"
                  aria-valuemin={240}
                  aria-valuemax={maxTeleprompterWidth}
                  aria-valuenow={teleprompterWidth}
                  aria-valuetext={`${teleprompterWidth} pixels`}
                  tabIndex={0}
                  title="Drag to resize Double-click to reset"
                  className={cn(
                    "group hidden touch-none cursor-col-resize items-center justify-center outline-none lg:flex focus-visible:bg-sky-100",
                    resizingSplit && "bg-sky-100/70",
                  )}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return
                    event.preventDefault()
                    event.currentTarget.focus()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    setResizingSplit(true)
                  }}
                  onPointerMove={(event) => {
                    if (
                      !event.currentTarget.hasPointerCapture(event.pointerId)
                    )
                      return
                    const grid = event.currentTarget.parentElement
                    if (!grid) return
                    resizeTeleprompter(
                      grid.getBoundingClientRect().right - event.clientX,
                    )
                  }}
                  onPointerUp={(event) => {
                    if (
                      event.currentTarget.hasPointerCapture(event.pointerId)
                    )
                      event.currentTarget.releasePointerCapture(event.pointerId)
                    setResizingSplit(false)
                  }}
                  onPointerCancel={() => setResizingSplit(false)}
                  onLostPointerCapture={() => setResizingSplit(false)}
                  onDoubleClick={() => setPreferredTeleprompterWidth(300)}
                  onKeyDown={(event) => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return
                    event.preventDefault()
                    event.stopPropagation()
                    const step = event.shiftKey ? 24 : 8
                    resizeTeleprompter(
                      event.key === "Home"
                        ? 240
                        : event.key === "End"
                          ? maxTeleprompterWidth
                          : teleprompterWidth +
                            (event.key === "ArrowLeft" ? step : -step),
                    )
                  }}
                >
                  <span
                    className={cn(
                      "h-10 w-[3px] rounded-full bg-slate-300 transition-colors group-hover:bg-sky-600 group-focus-visible:bg-sky-600",
                      resizingSplit && "bg-sky-600",
                    )}
                  />
                </div>
                {view === "sensing" ? (
                  <AudiencePulse slide={slide} />
                ) : (
                <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between shrink-0 border-b border-border px-4 py-2.5">
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <BookOpen size={15} className="text-slate-500" /> Smart
                      teleprompter
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-2 py-1 text-[10px] text-sky-700">
                      <span className="h-1 w-1 rounded-full bg-sky-600" /> Voice
                      synced
                    </span>
                  </div>
                  <div
                    tabIndex={0}
                    role="region"
                    aria-label="Teleprompter script"
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {paragraph > 0 && (
                      <p className="text-sm leading-relaxed text-slate-500">
                        {script[paragraph - 1]}
                      </p>
                    )}
                    <div className="relative -mx-1 rounded-lg border-l-[3px] border-sky-600 bg-[#E0F2FE] px-3 py-2">
                      <span className="mb-2 block text-[10px] font-semibold tracking-[0.16em] text-sky-700">
                        YOU'RE HERE
                      </span>
                      <p className="text-[22px] font-semibold leading-[1.4]">
                        {script[paragraph]}
                      </p>
                    </div>
                    {script[paragraph + 1] && (
                      <p className="text-sm leading-relaxed text-slate-600">
                        {script[paragraph + 1]}
                      </p>
                    )}
                    {script[paragraph + 2] && (
                      <p className="text-sm leading-relaxed text-slate-600">
                        {script[paragraph + 2]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[10px] text-slate-500">
                    <button
                      onClick={() =>
                        setParagraph((value) =>
                          Math.min(script.length - 1, value + 1),
                        )
                      }
                      className="flex items-center gap-1.5 hover:text-slate-900"
                    >
                      <Hand size={12} /> Swipe up to skip
                    </button>
                    <span className="h-3 border-l border-border" />
                    <button
                      onClick={() =>
                        setParagraph((value) => Math.max(0, value - 1))
                      }
                      className="flex items-center gap-1.5 hover:text-slate-900"
                    >
                      <ArrowDown size={11} /> Swipe down to revisit
                    </button>
                  </div>
                </section>
                )}
              </div>
            </>
          )}
          {view === "qa" && (
            <section className="relative flex min-h-[300px] flex-1 flex-col lg:min-h-0 items-center justify-center rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
              <div className="absolute left-5 top-5 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />{" "}
                Q&A audio bookmarked for post-talk review
              </div>
              <span className="mb-4 rounded-full bg-indigo-50 px-3 py-1 text-[11px] tracking-widest text-indigo-600">
                SPACE FOR CONVERSATION
              </span>
              <h2 className="text-[28px] font-semibold tracking-[0.04em] text-indigo-600">
                Q&A SESSION ACTIVE
              </h2>
              <div className="relative my-4 flex h-44 w-44 items-center justify-center">
                <svg
                  viewBox="0 0 240 240"
                  className="absolute inset-0 -rotate-90"
                >
                  <circle
                    cx="120"
                    cy="120"
                    r="108"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="7"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="108"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="679"
                    strokeDashoffset={679 * (1 - qaSeconds / 300)}
                  />
                </svg>
                <div className="text-center">
                  <span className="font-mono text-[48px] font-semibold">
                    {time(qaSeconds)}
                  </span>
                  <p className="mt-3 text-xs text-slate-500">TIME REMAINING</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaused(!paused)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs"
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}{" "}
                  {paused ? "Resume" : "Pause timer"}
                </button>
                <button
                  onClick={() => setQaSeconds(qaSeconds + 60)}
                  className="rounded-lg bg-sky-100 px-4 py-2 text-xs text-sky-700"
                >
                  +1 minute
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Use your voice to recall a slide, or select one below.
              </p>
            </section>
          )}
          {view === "audience" && (
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-slate-50">
              <div className="flex items-center justify-between px-5 py-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-2">
                  <Radio size={13} /> AUDIENCE SHARED DISPLAY
                </span>
                <button
                  onClick={download}
                  className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm"
                >
                  <QrCode size={16} /> Structured session notes{" "}
                  <Download size={13} />
                </button>
              </div>
              <div className="mx-auto aspect-[16/9] min-h-0 w-full flex-1 lg:aspect-auto">
                <Slide number={slide} />
              </div>
              <div className="shrink-0 bg-[#0f172a] px-6 py-3 text-white">
                <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-300">
                  <Mic size={12} className="text-sky-300" /> LIVE CAPTIONS{" "}
                  <span className="ml-auto">English auto-transcribed</span>
                </div>
                <p className="text-[24px] font-medium leading-relaxed">
                  {notes[slide - 1].before}
                  <mark className="rounded bg-yellow-200 px-2 text-slate-900">
                    {notes[slide - 1].highlight}
                  </mark>
                  {notes[slide - 1].after}
                </p>
              </div>
            </section>
          )}
          {view === "analytics" && (
            <>
              <div className="grid shrink-0 gap-3 grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Average pacing",
                    value: "135 WPM",
                    unit: "",
                    badge: "Optimal rhythm",
                  },
                  {
                    label: "Filler words",
                    value: "4",
                    unit: "words",
                    badge: "Low filler count",
                  },
                  {
                    label: "Q&A Duration",
                    value: "05:12",
                    unit: "",
                    badge: "Active Q&A",
                  },
                  {
                    label: "Audience Engagement",
                    value: "92%",
                    unit: "",
                    badge: "High interest",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                  >
                    <span className="text-xs text-slate-500">{stat.label}</span>
                    <div className="mt-2 flex h-8 items-baseline gap-1.5">
                      <span className="font-mono text-[32px] font-bold leading-none text-slate-900">
                        {stat.value}
                      </span>
                      {stat.unit && (
                        <span className="text-[13px] text-slate-500">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                    <span className="mt-3 w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {stat.badge}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:gap-0 lg:grid-cols-[minmax(0,1fr)_12px_var(--analytics-rail)]"
                style={{ "--analytics-rail": `${analyticsRail}%` } as CSSProperties}
              >
                <section className="flex min-h-0 flex-col overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex min-w-0 items-baseline">
                      <h2 className="text-[15px] font-semibold text-slate-900">
                        Session Pacing
                      </h2>
                      <p className="ml-2 text-xs font-normal text-slate-400">
                        24-minute acoustic & speed analysis
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-sm border border-emerald-300 bg-emerald-100" />
                      Target Zone (120–140 WPM)
                    </span>
                  </div>
                  <div className="mt-4 flex gap-1 rounded-xl border border-slate-200/50 bg-slate-100/80 p-1">
                    <span className="flex flex-[50] items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                      Slide 1–3 (12m)
                    </span>
                    <span className="flex-[19] rounded-lg bg-white/60 px-2 py-1.5 text-center text-xs font-medium text-slate-500 hover:bg-white">
                      Slide 4–6
                    </span>
                    <span className="flex-[31] rounded-lg bg-white/60 px-2 py-1.5 text-center text-xs font-medium text-slate-500 hover:bg-white">
                      Slide 7–12
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 700 278"
                    className="mt-4 min-h-0 w-full flex-1"
                    role="img"
                    aria-label="Pacing timeline with a 185 words per minute spike on slide 5"
                  >
                    <rect
                      x="45"
                      y="146"
                      width="625"
                      height="48"
                      fill="#16a34a10"
                    />
                    {[63, 108, 153, 198, 243].map((position, index) => (
                      <g key={position}>
                        <line
                          x1="45"
                          x2="670"
                          y1={position}
                          y2={position}
                          stroke="#e2e8f0"
                        />
                        <text
                          x="9"
                          y={position + 4}
                          fill="#64748b"
                          fontSize="10"
                        >
                          {200 - index * 25}
                        </text>
                      </g>
                    ))}
                    <path
                      d="M45 177 L75 168 L108 180 L140 149 L170 160 L202 84 L227 36 L250 103 L280 160 L310 169 L345 160 L375 188 L405 168 L440 158 L470 176 L500 163 L535 180 L560 162 L595 173 L628 161 L670 175"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <circle cx="264" cy="129" r="3" fill="#0284c7" />
                    <circle cx="362" cy="176" r="3" fill="#0284c7" />
                    <circle cx="514" cy="170" r="3" fill="#0284c7" />
                    <foreignObject x="168" y="170" width="118" height="22">
                      <div className="w-max rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] text-slate-600">
                        08:24 Laughter
                      </div>
                    </foreignObject>
                    <foreignObject x="308" y="190" width="158" height="22">
                      <div className="w-max rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] text-slate-600">
                        12:10 Reflective pause
                      </div>
                    </foreignObject>
                    <foreignObject x="470" y="178" width="130" height="22">
                      <div className="w-max rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] text-slate-600">
                        18:00 Q&A began
                      </div>
                    </foreignObject>
                    <circle cx="227" cy="36" r="5" fill="#dc2626" />
                    <foreignObject x="246" y="2" width="268" height="30">
                      <div className="w-max text-[11px] font-semibold text-red-600">
                        185 WPM Slide 5 (Pacing Spike)
                      </div>
                    </foreignObject>
                    {[0, 4, 8, 12, 16, 20, 24].map((minute, index) => (
                      <text
                        key={minute}
                        x={45 + index * 104}
                        y="269"
                        fill="#94a3b8"
                        fontSize="10"
                      >
                        {minute} min
                      </text>
                    ))}
                  </svg>
                </section>
                <div
                  role="separator"
                  aria-label="Resize session pacing and the side panel"
                  aria-orientation="vertical"
                  aria-valuemin={26}
                  aria-valuemax={58}
                  aria-valuenow={analyticsRail}
                  aria-valuetext={`${analyticsRail} percent`}
                  tabIndex={0}
                  title="Drag to resize Double-click to reset"
                  className={cn(
                    "group hidden touch-none cursor-col-resize items-center justify-center outline-none lg:flex focus-visible:bg-sky-100",
                    resizingAnalytics && "bg-sky-100/70",
                  )}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return
                    event.preventDefault()
                    event.currentTarget.focus()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    setResizingAnalytics(true)
                  }}
                  onPointerMove={(event) => {
                    if (!event.currentTarget.hasPointerCapture(event.pointerId))
                      return
                    const grid = event.currentTarget.parentElement
                    if (!grid) return
                    const rect = grid.getBoundingClientRect()
                    resizeAnalyticsRail(
                      ((rect.right - event.clientX) / rect.width) * 100,
                    )
                  }}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId))
                      event.currentTarget.releasePointerCapture(event.pointerId)
                    setResizingAnalytics(false)
                  }}
                  onPointerCancel={() => setResizingAnalytics(false)}
                  onLostPointerCapture={() => setResizingAnalytics(false)}
                  onDoubleClick={() => setAnalyticsRail(36)}
                  onKeyDown={(event) => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return
                    event.preventDefault()
                    event.stopPropagation()
                    const step = event.shiftKey ? 8 : 2
                    resizeAnalyticsRail(
                      event.key === "Home"
                        ? 58
                        : event.key === "End"
                          ? 26
                          : analyticsRail +
                            (event.key === "ArrowLeft" ? step : -step),
                    )
                  }}
                >
                  <span
                    className={cn(
                      "h-10 w-[3px] rounded-full bg-slate-300 transition-colors group-hover:bg-sky-600 group-focus-visible:bg-sky-600",
                      resizingAnalytics && "bg-sky-600",
                    )}
                  />
                </div>
                <section className="flex min-h-0 flex-col space-y-5 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm [scrollbar-width:thin]">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AI delivery coaching
                    </h2>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-xl border border-slate-200/80 border-l-4 border-l-amber-500 bg-white p-4 shadow-sm">
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                          <AlertCircle size={12} className="text-amber-500" />{" "}
                          Give ideas room to land
                        </span>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                          Slow down during Slides 5-7 where pace reached 185
                          WPM. Add deliberate 2-second pauses after key points.
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 border-l-4 border-l-slate-300 bg-white p-4 shadow-sm">
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                          <Sparkles size={12} className="text-slate-400" /> Pause
                          over filler words
                        </span>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                          4 filler words detected (&apos;um&apos;). Replacing
                          them with silence will improve authority.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bookmarked audio highlights
                    </h2>
                    <div className="mt-3 rounded-xl border border-slate-200/60 bg-slate-50 p-3.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Q&A segment Slide 3</span>
                        <span>18:02</span>
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-slate-800">
                        How does the gesture tracking work?
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          aria-label={playing ? "Pause clip" : "Play clip"}
                          onClick={() => {
                            setPlaying(!playing)
                            setNotice(
                              playing
                                ? "Playback paused"
                                : "Demo clip playback started",
                            )
                          }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-700 text-white"
                        >
                          {playing ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                        <Wave
                          small
                          color={
                            playing
                              ? "bg-sky-600 animate-pulse"
                              : "bg-slate-400"
                          }
                        />
                        <span className="font-mono text-[11px] text-slate-500">
                          01:24
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Slide time distribution
                      </h2>
                      <span className="shrink-0 text-xs font-medium text-slate-500">
                        3 Off-Pace Slides
                      </span>
                    </div>
                    <div className="mt-3 space-y-3.5 rounded-xl border border-slate-200/60 bg-slate-50 p-3.5">
                      {[
                        {
                          name: "Slide 1–3 (Opening)",
                          time: "12:00 / Target 5:00",
                          timeClass: "font-medium text-slate-500",
                          bar: "w-[85%] bg-amber-500/70",
                          note: "Overstayed by +7m (Took 50% of session time)",
                          noteClass: "text-slate-500",
                        },
                        {
                          name: "Slide 4–6 (Core Content)",
                          time: "4:30 / Target 5:00",
                          timeClass: "font-medium text-slate-500",
                          bar: "w-[45%] bg-emerald-500/65",
                          note: "On Track (Balanced delivery)",
                          noteClass: "text-slate-400",
                        },
                        {
                          name: "Slide 7–12 (Conclusion)",
                          time: "1:30 / Target 8:00",
                          timeClass: "font-medium text-slate-500",
                          bar: "w-[18%] bg-blue-500/65",
                          note: "Rushed by -6.5m (Averaged only 15s per slide)",
                          noteClass: "text-slate-500",
                        },
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[12px] font-semibold text-slate-800">
                              {item.name}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-[11px]",
                                item.timeClass,
                              )}
                            >
                              {item.time}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className={cn("h-full rounded-full", item.bar)} />
                          </div>
                          <p className={cn("mt-1 text-[11px]", item.noteClass)}>
                            {item.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
          {view === "sensing" && <AcousticTimeline />}
          {view === "presenter" && (
            <div className="shrink-0 rounded-xl border border-border bg-white px-3 py-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Layers size={13} /> SLIDE NAVIGATOR{" "}
                  <span className="ml-2 text-slate-600">{slides.length} slides</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {view === "qa"
                    ? "Voice recall ready Try “Jump to slide 3”"
                    : "← → to navigate"}
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {slides.map((title, index) => (
                  <button
                    key={title}
                    onClick={() => setSlide(index + 1)}
                    title={
                      index === 2
                        ? "Voice recall: Jump to Slide 3 Architecture"
                        : title
                    }
                    className="group w-[92px] shrink-0 text-left"
                  >
                    <div
                      className={cn(
                        "aspect-video overflow-hidden rounded-md border-2 transition",
                        slide === index + 1
                          ? "border-sky-600"
                          : "border-transparent opacity-60 group-hover:opacity-100",
                      )}
                    >
                      <Slide number={index + 1} compact />
                    </div>
                    <div className="mt-1 flex gap-1.5 text-[9px]">
                      <span
                        className={
                          slide === index + 1
                            ? "text-sky-700"
                            : "text-slate-500"
                        }
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "truncate",
                          slide === index + 1
                            ? "text-slate-900"
                            : "text-slate-500",
                        )}
                      >
                        {title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {view === "analytics" ? (
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck size={13} /> Session sensing processed on-device.
                Privacy preserved.
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setNotice("Full session replay started")}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-[13px] font-medium text-slate-800 hover:bg-slate-200"
                >
                  <Play size={13} /> Play Full Replay
                </button>
                <button
                  onClick={download}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600"
                >
                  <Download size={13} /> Export PDF Report
                </button>
                <button
                  onClick={() => setNotice("Summary ready to share")}
                  className="rounded-lg bg-sky-700 px-3 py-2 text-[11px] font-semibold text-white"
                >
                  <Share2 size={13} className="mr-1.5 inline" /> Share Summary
                </button>
              </div>
            </footer>
          ) : (
          view !== "audience" && (
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2">
            <div className="hidden items-center gap-2 text-[10px] text-slate-500 xl:flex">
              <ShieldCheck size={13} />
              <span>
                Room sensing is processed on-device. No audience audio is
                stored.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {view !== "qa" && (
                <button
                  onClick={() => setLaser(!laser)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px]",
                    laser ? "text-sky-700" : "text-slate-500",
                  )}
                >
                  <MousePointer2 size={13} /> Laser {laser ? "on" : "off"}
                </button>
              )}
              {view !== "qa" && (
                <button
                  onClick={() => setPaused(!paused)}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px] text-slate-600"
                >
                  {paused ? <Play size={13} /> : <Pause size={13} />}{" "}
                  {paused ? "Resume session" : "Pause session"}
                </button>
              )}
              <NavLink
                to={view === "qa" ? "/" : "/qa"}
                className="flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white"
              >
                <Mic size={13} />
                {view === "qa" ? "End Q&A" : "Enter Q&A mode"}
              </NavLink>
            </div>
          </footer>
          )
          )}
        </div>
      </main>
      {view !== "analytics" && (
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 h-[3px]",
          !stage && "lg:left-[var(--sidebar-width)]",
          view === "qa"
            ? "bg-indigo-600"
            : pace === "fast"
              ? "bg-amber-500"
              : pace === "slow"
                ? "bg-sky-500"
                : "bg-green-600",
        )}
      />
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-sky-200 bg-white px-5 py-4 text-xs shadow-lg"
        >
          <Check size={16} className="text-sky-700" />
          {notice}
        </div>
      )}
      {settings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-5"
          onClick={() => setSettings(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Session settings"
            className="w-full max-w-md rounded-2xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)] p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Session settings</h2>
              <button
                aria-label="Close settings"
                onClick={() => setSettings(false)}
              >
                <X size={18} />
              </button>
            </div>
            {[
              { label: "Voice alignment", value: mic, set: () => setMic(!mic) },
              {
                label: "Gesture laser pointer",
                value: laser,
                set: () => setLaser(!laser),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-t border-border py-4 text-sm"
              >
                <span>{item.label}</span>
                <button
                  role="switch"
                  aria-checked={item.value}
                  onClick={item.set}
                  className={cn(
                    "flex h-6 w-11 rounded-full p-1",
                    item.value ? "justify-end bg-sky-600" : "bg-slate-300",
                  )}
                >
                  <span className="h-4 w-4 rounded-full bg-white" />
                </button>
              </div>
            ))}
            <div className="border-t border-border pt-4 text-xs text-slate-500">
              Pacing target{" "}
              <span className="float-right text-green-700">120–140 WPM</span>
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-500">
              Demo session Microphone and vision states are simulated. No
              camera or microphone access is requested.
            </p>
            <button
              onClick={() => setSettings(false)}
              className="mt-6 w-full rounded-lg bg-sky-700 py-3 text-xs font-semibold text-white"
            >
              Done
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
const router = createBrowserRouter([
  { path: "/", Component: AppShell },
  { path: "/sensing", Component: AppShell },
  { path: "/qa", Component: AppShell },
  { path: "/audience", Component: AppShell },
  { path: "/analytics", Component: AppShell },
  { path: "*", Component: AppShell },
])
export default function App() {
  return <RouterProvider router={router} />
}
