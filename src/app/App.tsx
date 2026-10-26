import { useEffect, useRef, useState } from "react"
import ClassroomAttention from "./Attention"
import InteractionGuide from "./InteractionGuide/IntereactionGuide"
import type { CSSProperties } from "react"
import {
  createBrowserRouter,
  RouterProvider,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router"
import {
  Activity,
  Menu,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BatteryFull,
  Bell,
  BookOpen,
  Check,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Eye,
  Expand,
  FileText,
  Gauge,
  Users,
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
  Sparkles,
  Smartphone,
  Square,
  X,
} from "lucide-react"

const cn = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ")
type GestureDetector = {
  estimateHands: (
    input: HTMLVideoElement,
    config?: { flipHorizontal?: boolean staticImageMode?: boolean },
  ) => Promise<Array<{ keypoints: Array<{ x: number y: number }> }>>
  dispose: () => void
}
const slides = [
  "Finance Report",
  "Introduction",
  "Overall Sales Report",
  "Performance",
  "Customer Data",
  "Profit Obtained",
  "Customer Satisfaction",
  "Evaluation",
  "Next Steps",
  "Thank You",
]
const notes = [
  {
    before: "I'll take you through ",
    highlight: "how the period closed",
    after: ", and the three places we should fix.",
  },
  {
    before: "The business ",
    highlight: "made money",
    after: ". The strain shows up after the sale.",
  },
  {
    before: "Sales ",
    highlight: "came in where we expected",
    after: ". This is not a demand problem.",
  },
  {
    before: "The total looks fine. The leak is ",
    highlight: "after someone decides to buy",
    after: ".",
  },
  {
    before: "The mix has not moved. ",
    highlight: "Repeat purchase",
    after: " is the number to remember.",
  },
  {
    before: "Gross profit was ",
    highlight: "1.5 billion rupiah",
    after: ". Net profit was 1.2 billion.",
  },
  {
    before: "Customers are not leaving in a wave. ",
    highlight: "The next order is no longer automatic",
    after: ".",
  },
  {
    before: "Fix ",
    highlight: "communication, product information, and shipping",
    after: ", in that order.",
  },
  {
    before: "Do those three ",
    highlight: "before we add a new campaign",
    after: ".",
  },
  {
    before: "That's the period. ",
    highlight: "I'll take questions",
    after: ".",
  },
]
const line = (note: typeof notes[number]) =>
  `${note.before}${note.highlight}${note.after}`
const script = [
  "I'll take you through how the period closed, and the three places we should fix.",
  "Sales, profit, then the customer issues that are eating into the result.",
  "The business made money.",
  "The strain shows up after the sale, not in the headline.",
  "Sales came in where we expected.",
  "Nothing in the total says we have a demand problem.",
  "Performance is fine if you only look at the total.",
  "The leak is what happens after someone decides to buy.",
  "The customer mix, by gender and by age, has not moved.",
  "Repeat purchase is the number to remember. People are not coming back as often as they should.",
  "Gross profit was 1.5 billion rupiah.",
  "Net profit was 1.2 billion. That gap is where the extra cost is sitting.",
  "Customers are not unhappy enough to leave in a wave.",
  "They are unhappy enough that the next order is no longer automatic.",
  "Three fixes, in this order.",
  "Talk to customers in plain language. Too much of the follow-up never lands.",
  "Make the product information easy for someone who has never bought from us.",
  "Look again at the shipping partners. Deliveries are not moving the way they should.",
  "We do those three before we add a new campaign.",
  "Clearer conversations, clearer product pages, and a shipping review.",
  "That's the period.",
  "I'll stop there and take questions.",
]
const cue = [0, 2, 4, 6, 8, 10, 12, 14, 18, 20]
const teleprompterWpm = 132

const estimateTeleprompterDelay = (
  sentence: string,
  wordsPerMinute: number,
) => {
  const wordCount = sentence.trim().split(/\s+/).filter(Boolean).length
  const pauseCount = (sentence.match(/[,;:—-]/g) ?? []).length
  const sentenceEndingPause = /[.!?]$/.test(sentence.trim()) ? 300 : 0
  const readingTime = (wordCount / wordsPerMinute) * 60_000
  return Math.round(
    Math.max(
      1800,
      Math.min(12_000, readingTime + pauseCount * 350 + sentenceEndingPause),
    ),
  )
}

const normaliseScriptText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)

const findScriptMatch = (
  transcript: string,
  slide: number,
  currentParagraph: number,
) => {
  const transcriptTokens = new Set(normaliseScriptText(transcript))
  if (transcriptTokens.size < 3) return null

  const start = Math.max(cue[slide - 1] ?? 0, currentParagraph)
  const end = cue[slide] ?? script.length
  let bestMatch: { index: number score: number } | null = null

  for (let index = start; index < end; index += 1) {
    const sentenceTokens = new Set(normaliseScriptText(script[index]))
    const sharedTokens = [...sentenceTokens].filter((token) =>
      transcriptTokens.has(token),
    ).length
    const score =
      sharedTokens / Math.min(sentenceTokens.size, transcriptTokens.size)
    if (
      sharedTokens >= 3 &&
      score >= 0.45 &&
      (!bestMatch || score > bestMatch.score)
    ) {
      bestMatch = { index, score }
    }
  }

  return bestMatch?.index ?? null
}

type CaptionEntry = {
  slide: number
  text: string
  capturedAt: string
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: {
    resultIndex: number
    results: ArrayLike<{ 0: { transcript: string } isFinal: boolean }>
  }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type CaptionMessage = { type: "caption" caption: CaptionEntry } | {
  type: "interim"
  text: string
} | { type: "status" active: boolean } | { type: "pace" wpm: number | null } | {
  type: "clear"
}
function Wave({
  color = "bg-sky-700",
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
function Slide({ number = 1 }: { number?: number compact?: boolean }) {
  const title = slides[number - 1] || slides[0]
  return (
    <img
      src={`/sample/${String(number).padStart(2, "0")}.jpg`}
      alt={title}
      className="h-full w-full object-contain"
    />
  )
}
type SpokenWord = { at: number slide: number }
type PacePoint = { t: number wpm: number slide: number peak: boolean }
type PaceBand = "idle" | "optimal" | "fast" | "slow"
type SessionPhase = "ready" | "live" | "paused" | "ended"

const paceY = (wpm: number) => {
  const clamped = Math.max(100, Math.min(200, wpm))
  return 64 - ((clamped - 100) / 100) * 56
}
const paceX = (index: number, count: number) =>
  count <= 1 ? 320 : (index / (count - 1)) * 640
const paceClock = (seconds: number) => {
  const whole = Math.max(0, Math.round(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

function PaceTimeline({ points }: { points: PacePoint[] }) {
  const line = points
    .map(
      (point, index) =>
        `${
          index ? "L" : "M"
        }${paceX(index, points.length).toFixed(1)},${paceY(point.wpm).toFixed(1)}`,
    )
    .join(" ")
  const last = points[points.length - 1]
  const mid = points[Math.floor(points.length / 2)]
  return (
    <div className="shrink-0 rounded-xl border border-border bg-white px-3 py-2">
      <div className="mb-1.5 flex items-center">
        <span className="flex items-center gap-2 text-[11px] text-slate-500">
          <Activity size={13} className="text-slate-400" />
          SPEAKING RATE
          <span className="ml-2 text-slate-600">Target 120–140 WPM</span>
        </span>
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
            fill="#ecfdf5"
          />
          {line && (
            <path
              d={line}
              fill="none"
              stroke="#0F172A"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {points.map((point, index) =>
            point.peak ? (
              <circle
                key={`${point.t}-${index}`}
                cx={paceX(index, points.length)}
                cy={paceY(point.wpm)}
                r="3.5"
                fill="#BE123C"
                className="animate-pulse"
              >
                <title>{`${point.wpm} WPM · Slide ${point.slide}`}</title>
              </circle>
            ) : null,
          )}
        </svg>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
        <span>{paceClock(points[0]?.t ?? 0)}</span>
        <span>{paceClock(mid?.t ?? 0)}</span>
        <span>{paceClock(last?.t ?? 0)}</span>
      </div>
    </div>
  )
}
function AudienceAttentionAnalytics() {
  const attention = [64, 67, 70, 72, 69, 74, 79, 81, 84, 78, 68, 62, 57, 64, 70]
  const chart = { left: 28, right: 1088, top: 22, bottom: 210 }
  const chartPoints: Array<[number, number]> = attention.map((value, index) => [
    chart.left + (index / (attention.length - 1)) * (chart.right - chart.left),
    chart.top + (1 - value / 100) * (chart.bottom - chart.top),
  ])
  const line = chartPoints.slice(1).reduce((path, point, index) => {
    const previous = chartPoints[index]
    const before = chartPoints[Math.max(0, index - 1)]
    const after = chartPoints[Math.min(chartPoints.length - 1, index + 2)]
    const controlDistance = (point[0] - previous[0]) / 6
    return `${path} C ${previous[0] + controlDistance},${previous[1] + (point[1] - before[1]) / 6} ${point[0] - controlDistance},${point[1] - (after[1] - previous[1]) / 6} ${point[0]},${point[1]}`
  }, `M ${chartPoints[0][0]},${chartPoints[0][1]}`)
  const area = `${line} L ${chartPoints[chartPoints.length - 1][0]},${chart.bottom} L ${chartPoints[0][0]},${chart.bottom} Z`
  const peakIndex = attention.indexOf(Math.max(...attention))
  const peakPoint = chartPoints[peakIndex]
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Audience attention
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Engagement patterns from anonymous room signals
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Strong
          connection
        </span>
      </div>
      <div className="mt-4 grid items-stretch gap-3 xl:grid-cols-[270px_minmax(0,1fr)]">
        <article className="h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between text-sky-100">
            <span className="flex items-center gap-2 text-xs font-medium">
              <Eye size={15} /> Audience pulse
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium">
              avg score
            </span>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="font-mono text-5xl font-bold tracking-tight">
              76
            </span>
            <span className="mb-1 text-sm text-sky-100">/ 100</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            The room stayed engaged through the financial comparison, with one
            short attention dip.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Present
              </p>
              <p className="mt-1 font-mono text-xl font-semibold">8</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Peak
              </p>
              <p className="mt-1 font-mono text-xl font-semibold">84%</p>
            </div>
          </div>
        </article>
        <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Attention over time
              </h3>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Class average across the session
              </p>
            </div>
            <span className="rounded-md bg-sky-100 px-2 py-1 font-mono text-[11px] font-semibold text-sky-700">
              76%
            </span>
          </div>
          <svg
            viewBox="0 0 1100 264"
            preserveAspectRatio="none"
            className="mt-3 h-60 w-full"
            role="img"
            aria-label="Audience attention area chart with a peak of 84 percent at 14 minutes"
          >
            <defs>
              <linearGradient
                id="attention-area-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </linearGradient>
              <filter
                id="attention-glow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[25, 50, 75].map((value) => {
              const y =
                chart.top + (1 - value / 100) * (chart.bottom - chart.top)
              return (
                <g key={value}>
                  <line
                    x1={chart.left}
                    x2={chart.right}
                    y1={y}
                    y2={y}
                    stroke="#f1f5f9"
                  />
                  <text
                    x={chart.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {value}
                  </text>
                </g>
              )
            })}
            <text
              x={chart.left - 8}
              y={chart.bottom + 4}
              textAnchor="end"
              fill="#64748b"
              fontSize="11"
              fontWeight="500"
            >
              0
            </text>
            <path d={area} fill="url(#attention-area-fill)" />
            <path
              d={line}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {chartPoints.map((point, index) => {
              const value = attention[index]
              const low = value < 65
              return (
                <g key={`${value}-${index}`} className="group">
                  <circle cx={point[0]} cy={point[1]} r="12" fill="transparent">
                    <title>{`${Math.round((index / (attention.length - 1)) * 24)} min · ${value}% attention`}</title>
                  </circle>
                  {low && (
                    <circle
                      cx={point[0]}
                      cy={point[1]}
                      r="7"
                      fill="#f59e0b"
                      opacity="0.2"
                      className="animate-pulse"
                    />
                  )}
                  {low && (
                    <circle
                      cx={point[0]}
                      cy={point[1]}
                      r="3.5"
                      fill="#f59e0b"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              )
            })}
            <g filter="url(#attention-glow)">
              <circle
                cx={peakPoint[0]}
                cy={peakPoint[1]}
                r="8"
                fill="#14b8a6"
                opacity="0.2"
              />
              <circle
                cx={peakPoint[0]}
                cy={peakPoint[1]}
                r="4"
                fill="#14b8a6"
                stroke="white"
                strokeWidth="2"
              />
            </g>
            <g
              transform={`translate(${peakPoint[0] - 39}, ${Math.max(4, peakPoint[1] - 35)})`}
            >
              <rect width="78" height="22" rx="7" fill="#0f172a" />
              <text
                x="39"
                y="15"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="600"
              >
                Peak 84%
              </text>
            </g>
            {[0, 4, 8, 12, 16, 20, 24].map((minute, index) => {
              const x = chart.left + (index / 6) * (chart.right - chart.left)
              return (
                <g key={minute}>
                  <line
                    x1={x}
                    x2={x}
                    y1={chart.bottom}
                    y2={chart.bottom + 4}
                    stroke="#cbd5e1"
                  />
                  <text
                    x={x}
                    y="234"
                    textAnchor={
                      index === 0 ? "start" : index === 6 ? "end" : "middle"
                    }
                    fill="#64748b"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {minute} min
                  </text>
                </g>
              )
            })}
          </svg>
        </article>
      </div>
      <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-3">
        <article className="flex h-full flex-col rounded-xl border border-sky-100 bg-sky-50/70 p-5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
            <Sparkles size={14} /> Key insight
          </span>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
            Attention was strongest when you compared profit and customer data.
            Reuse that side-by-side storytelling pattern.
          </p>
        </article>
        <article className="flex h-full flex-col rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-800">
            Engagement distribution
          </h3>
          <div className="mt-3 space-y-2.5">
            {[
              { label: "Highly engaged", value: 5, tone: "bg-emerald-500" },
              { label: "Following along", value: 2, tone: "bg-sky-500" },
              { label: "Needs a check-in", value: 1, tone: "bg-amber-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-[11px] text-slate-500"
              >
                <span className="w-28 shrink-0">{item.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${item.tone}`}
                    style={{ width: `${(item.value / 8) * 100}%` }}
                  />
                </span>
                <span className="w-3 text-right font-mono text-slate-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className="flex h-full flex-col rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-800">
            Room activity
          </h3>
          <div className="mt-3 space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Hand size={14} className="text-sky-600" /> Hands raised
              </span>
              <b className="font-mono text-slate-800">4</b>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Smartphone size={14} className="text-amber-500" /> Phone
                moments
              </span>
              <b className="font-mono text-slate-800">2</b>
            </div>
            <p className="border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-400">
              Add a quick question after Slide 5 to recover the one attention
              dip.
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}
function AudiencePulse({
  wpm,
  band,
  peak,
  points,
  seconds,
  slide,
  sessionPhase,
}: {
  wpm: number | null
  band: PaceBand
  peak: PacePoint | null
  points: PacePoint[]
  seconds: number
  slide: number
  sessionPhase: SessionPhase
}) {
  const average = points.length
    ? Math.round(
        points.reduce((sum, point) => sum + point.wpm, 0) / points.length,
      )
    : null
  const recentPoints = points.slice(-12)
  const trend = recentPoints
    .map((point, index) => {
      const x =
        recentPoints.length <= 1
          ? 160
          : (index / (recentPoints.length - 1)) * 320
      const y = 52 - ((Math.max(100, Math.min(180, point.wpm)) - 100) / 80) * 44
      return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  const nextCue =
    slide === 5
      ? "This is a dense data slide — pause after the headline."
      : slide === 6 || slide === 7
        ? "Let the numbers land before moving to the next point."
        : "Lead with one clear takeaway before the detail."
  const advice =
    peak != null
      ? `Pacing spiked to ${peak.wpm} WPM on Slide ${peak.slide}. Pause before the next figure.`
      : band === "fast"
        ? "Speaking rate too fast. Take a breath and pause at commas."
        : band === "slow"
          ? "Pace is a little low. Keep your energy up!"
          : band === "optimal"
            ? "You're in a great rhythm."
            : "Start live captions to measure speaking rate."
  const hasPaceData = wpm !== null || points.length > 0
  const statusMessage = hasPaceData
    ? advice
    : sessionPhase === "live"
      ? "Start live captions to measure speaking rate."
      : "Start presentation, then live captions to measure speaking rate."
  const coachingTone = !hasPaceData
    ? "border-slate-200/80 bg-slate-50"
    : band === "fast"
      ? "border-amber-200/70 bg-amber-50/75"
      : band === "slow"
        ? "border-sky-200/70 bg-sky-50/75"
        : "border-emerald-200/70 bg-emerald-50/75"
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-800">
          <Activity size={15} className="text-sky-500" /> Pacing coach
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              band === "fast"
                ? "bg-amber-500"
                : band === "slow"
                  ? "bg-sky-700"
                  : band === "optimal"
                    ? "bg-emerald-500"
                    : "bg-slate-400",
            )}
          />
          Live rate
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Activity size={12} className="text-sky-500" /> Speaking rate
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold leading-none text-slate-900">
              {wpm ?? "—"}
            </span>
            <span
              className={cn(
                "mb-0.5 rounded-full border px-2 py-0.5 text-xs font-bold",
                band === "fast"
                  ? "border-amber-200/60 bg-amber-50 text-amber-700"
                  : band === "slow"
                    ? "border-sky-200/60 bg-sky-50 text-sky-700"
                    : band === "optimal"
                      ? "border-emerald-200/60 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              {band === "fast"
                ? "WPM · Fast"
                : band === "slow"
                  ? "WPM · Slow"
                  : band === "optimal"
                    ? "WPM · Optimal"
                    : "WPM · Waiting"}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <span
              className={cn(
                "block h-full rounded-full transition-all duration-500",
                band === "fast"
                  ? "bg-amber-400"
                  : band === "slow"
                    ? "bg-sky-400"
                    : "bg-emerald-500",
              )}
              style={{
                width: `${Math.max(0, Math.min(100, (((wpm ?? 0) - 80) / 100) * 100))}%`,
              }}
            />
          </div>
          <p className="mt-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            Target 120–140 WPM
          </p>
        </section>
        {points.length >= 2 ? (
          <section className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-600">Recent pace</span>
              <span className="font-mono text-slate-400">
                last {recentPoints.length} samples
              </span>
            </div>
            <svg
              viewBox="0 0 320 56"
              preserveAspectRatio="none"
              className="mt-2 h-12 w-full"
              role="img"
              aria-label="Recent speaking pace trend"
            >
              <rect x="0" y="30" width="320" height="11" fill="#dcfce7" />
              <path
                d={trend}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-500">
            Your pace trend appears after two caption samples.
          </section>
        )}
        <section className="grid grid-cols-2 gap-2">
          {[
            { label: "Session time", value: paceClock(seconds), icon: Clock3 },
            {
              label: "Current slide",
              value: `${String(slide).padStart(2, "0")} / ${slides.length}`,
              icon: Layers,
            },
            {
              label: "Average pace",
              value: average ? `${average} WPM` : "—",
              icon: Gauge,
            },
            {
              label: "Fastest burst",
              value: peak ? `${peak.wpm} WPM` : "—",
              icon: Activity,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200/70 bg-slate-50/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <Icon size={11} className="text-sky-500" /> {label}
              </span>
              <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
            </div>
          ))}
        </section>
        <section className={cn("rounded-xl border p-3.5", coachingTone)}>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Sparkles size={13} className="text-amber-500" />
            {hasPaceData ? "Live coaching" : "Coaching status"}
          </div>
          <p className="text-xs font-medium leading-relaxed text-slate-600">
            {statusMessage}
          </p>
        </section>
        <section className="rounded-xl border border-sky-200/60 bg-sky-50/80 p-3.5 text-slate-800">
          <div className="flex items-center gap-2">
            <Check size={13} className="text-sky-700" />
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
              Slide {slide} tip
            </span>
          </div>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
            {nextCue}
          </p>
        </section>
      </div>
    </section>
  )
}
function AppShell() {
  const path = useLocation().pathname
  const navigate = useNavigate()
  const view = path === "/" ? "presenter" : path.slice(1)
  const stage = view === "qa" || view === "audience"
  const [slide, setSlide] = useState(1)
  const [paragraph, setParagraph] = useState(0)
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("ready")
  const [mic, setMic] = useState(false)
  const [laser, setLaser] = useState(true)
  const [settings, setSettings] = useState(false)
  const [help, setHelp] = useState(false)
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
  const slideRef = useRef(slide)
  const paragraphRef = useRef(paragraph)
  const viewRef = useRef(view)
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
    const nextParagraph = cue[slide - 1] ?? 0
    setParagraph(nextParagraph)
    slideRef.current = slide
    paragraphRef.current = nextParagraph
  }, [slide])
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
  const [sessionEndedAt, setSessionEndedAt] = useState<Date | null>(null)
  const [qaSeconds, setQaSeconds] = useState(299)
  const [qaTranscript, setQaTranscript] = useState<CaptionEntry[]>([])
  const [qaRecording, setQaRecording] = useState(false)
  const [qaAudioUrl, setQaAudioUrl] = useState("")
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [gestureStatus, setGestureStatus] = useState("Camera off")
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [wpm, setWpm] = useState<number | null>(null)
  const [pacePoints, setPacePoints] = useState<PacePoint[]>([])
  const wordsRef = useRef<SpokenWord[]>([])
  const pacePointsRef = useRef<PacePoint[]>([])
  const burstRef = useRef<{ index: number wpm: number } | null>(null)
  const paceStartedRef = useRef<number | null>(null)
  const band: PaceBand =
    wpm == null ? "idle" : wpm > 140 ? "fast" : wpm < 120 ? "slow" : "optimal"
  const latestPeak =
    [...pacePoints].reverse().find((point) => point.peak) ?? null
  const [teleprompterAutoScroll, setTeleprompterAutoScroll] = useState(false)
  const [captions, setCaptions] = useState<CaptionEntry[]>([])
  const [interimCaption, setInterimCaption] = useState("")
  const [captionStatus, setCaptionStatus] =
    useState<"idle" | "listening" | "unsupported">("idle")
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const shouldListenRef = useRef(false)
  const captionChannelRef = useRef<BroadcastChannel | null>(null)
  const qaRecorderRef = useRef<MediaRecorder | null>(null)
  const qaStreamRef = useRef<MediaStream | null>(null)
  const qaChunksRef = useRef<Blob[]>([])
  const gestureVideoRef = useRef<HTMLVideoElement | null>(null)
  const gestureStreamRef = useRef<MediaStream | null>(null)
  const gestureFrameRef = useRef<number | null>(null)
  const gestureStableSinceRef = useRef<number | null>(null)
  const gestureStartingRef = useRef(false)
  const handDetectorRef = useRef<GestureDetector | null>(null)
  useEffect(() => {
    if (captionStatus !== "listening") return
    const timer = window.setInterval(() => {
      const now = Date.now()
      wordsRef.current = wordsRef.current.filter(
        (word) => now - word.at <= 8000,
      )
      if (wordsRef.current.length === 0) return
      const next = Math.round((wordsRef.current.length / 8) * 60)
      const slideNow = wordsRef.current[wordsRef.current.length - 1].slide
      const started = paceStartedRef.current ?? now
      const points = pacePointsRef.current.slice()
      points.push({
        t: (now - started) / 1000,
        wpm: next,
        slide: slideNow,
        peak: false,
      })
      if (next > 140) {
        const burst = burstRef.current
        if (!burst || next >= burst.wpm) {
          burstRef.current = { index: points.length - 1, wpm: next }
        }
      } else if (burstRef.current) {
        const index = burstRef.current.index
        points[index] = { ...points[index], peak: true }
        burstRef.current = null
      }
      pacePointsRef.current = points
      setPacePoints(points)
      setWpm(next)
      captionChannelRef.current?.postMessage({ type: "pace", wpm: next })
    }, 2000)
    return () => window.clearInterval(timer)
  }, [captionStatus])
  useEffect(() => {
    const timer = setInterval(() => {
      if (sessionPhase === "live") setSeconds((value) => value + 1)
      if (view === "qa" && sessionPhase === "live")
        setQaSeconds((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionPhase, view])
  useEffect(() => {
    viewRef.current = view
  }, [view])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(""), 4000)
    return () => clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      recognitionRef.current?.stop()
    }
  }, [])
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return
    const channel = new BroadcastChannel("presenterplus-live-captions")
    captionChannelRef.current = channel
    channel.onmessage = (event: MessageEvent<CaptionMessage>) => {
      const message = event.data
      if (message.type === "caption") {
        setCaptions((items) => [...items, message.caption])
      }
      if (message.type === "interim") setInterimCaption(message.text)
      if (message.type === "status") setMic(message.active)
      if (message.type === "pace") setWpm(message.wpm)
      if (message.type === "clear") {
        setCaptions([])
        setInterimCaption("")
        setMic(false)
        setWpm(null)
      }
    }
    return () => {
      captionChannelRef.current = null
      channel.close()
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.removeItem("presenterplus-captions")
    } catch {}
  }, [])
  useEffect(() => {
    if (
      view !== "presenter" ||
      sessionPhase !== "live" ||
      !teleprompterAutoScroll
    )
      return
    const end = cue[slide] ?? script.length
    if (paragraph >= end - 1) return

    const delay = estimateTeleprompterDelay(script[paragraph], teleprompterWpm)
    const timer = window.setTimeout(() => {
      const nextParagraph = Math.min(end - 1, paragraphRef.current + 1)
      paragraphRef.current = nextParagraph
      setParagraph(nextParagraph)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [paragraph, sessionPhase, slide, teleprompterAutoScroll, view])
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
  const completedSessionLabel = sessionEndedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(sessionEndedAt)
    : null
  const setTeleprompterPosition = (nextParagraph: number) => {
    const start = cue[slideRef.current - 1] ?? 0
    const end = cue[slideRef.current] ?? script.length
    const boundedParagraph = Math.max(start, Math.min(end - 1, nextParagraph))
    paragraphRef.current = boundedParagraph
    setParagraph(boundedParagraph)
  }
  const stopQaRecording = () => {
    const recorder = qaRecorderRef.current
    if (recorder && recorder.state !== "inactive") recorder.stop()
    else {
      qaStreamRef.current?.getTracks().forEach((track) => track.stop())
      qaStreamRef.current = null
      setQaRecording(false)
    }
  }
  const startQaRecording = async () => {
    if (qaRecorderRef.current?.state === "recording") return
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setNotice("Audio recording is not available in this browser")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      qaStreamRef.current = stream
      qaChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size) qaChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const audio = new Blob(qaChunksRef.current, { type: recorder.mimeType })
        if (audio.size) {
          setQaAudioUrl((previousUrl) => {
            if (previousUrl) URL.revokeObjectURL(previousUrl)
            return URL.createObjectURL(audio)
          })
          setNotice("Q&A audio bookmarked for post-talk review")
        }
        stream.getTracks().forEach((track) => track.stop())
        qaStreamRef.current = null
        setQaRecording(false)
      }
      recorder.start()
      qaRecorderRef.current = recorder
      setQaRecording(true)
    } catch {
      setNotice("Microphone access is required to record the Q&A")
    }
  }
  const handleVoiceModeCommand = (transcript: string) => {
    const command = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, " ")
    const qaWords = "q a|q and a|questions"
    const entersQa = new RegExp(
      `\\b(enter|start|open)\\s+(${qaWords})\\b`,
    ).test(command)
    const endsQa = new RegExp(`\\b(end|exit|close)\\s+(${qaWords})\\b`).test(
      command,
    )
    if (entersQa && viewRef.current !== "qa") {
      navigate("/qa")
      setNotice("Voice command received: Q&A mode")
    }
    if (endsQa && viewRef.current === "qa") {
      stopQaRecording()
      navigate("/")
      setNotice("Voice command received: lecture mode")
    }
  }
  const stopGestureControl = () => {
    if (gestureFrameRef.current) cancelAnimationFrame(gestureFrameRef.current)
    gestureFrameRef.current = null
    gestureStableSinceRef.current = null
    gestureStreamRef.current?.getTracks().forEach((track) => track.stop())
    gestureStreamRef.current = null
    handDetectorRef.current?.dispose()
    handDetectorRef.current = null
    setGestureEnabled(false)
    setGestureStatus("Camera off")
  }
  const describeGestureError = (error: unknown) => {
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError") {
        return "Camera permission was denied. Allow camera access in your browser settings."
      }
      if (error.name === "NotFoundError") {
        return "No camera was found. Connect or enable a camera, then try again."
      }
      if (error.name === "NotReadableError") {
        return "Your camera is in use by another app. Close Zoom, FaceTime, or another camera app, then try again."
      }
    }
    if (error instanceof Error) {
      return `Gesture camera could not start: ${error.message}`
    }
    return "Gesture camera could not start. Please try again."
  }
  const startGestureControl = async () => {
    if (gestureEnabled) {
      stopGestureControl()
      return
    }
    if (gestureStartingRef.current) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice("Camera access is not available in this browser")
      return
    }
    try {
      gestureStartingRef.current = true
      setGestureStatus("Requesting camera permission")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      const video = gestureVideoRef.current
      if (!video) throw new Error("Camera preview is unavailable")
      gestureStreamRef.current = stream
      video.srcObject = stream
      await video.play()
      setGestureEnabled(true)
      setGestureStatus("Camera on - loading palm detection")

      const [handPoseDetection, tensorflow, wasmBackend] = await Promise.all([
        import("@tensorflow-models/hand-pose-detection"),
        import("@tensorflow/tfjs-core"),
        import("@tensorflow/tfjs-backend-wasm"),
      ])
      wasmBackend.setWasmPaths(
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/",
      )
      await tensorflow.setBackend("wasm")
      await tensorflow.ready()
      const detector = (await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        { runtime: "tfjs", modelType: "full", maxHands: 2 },
      )) as GestureDetector
      if (gestureStreamRef.current !== stream) {
        detector.dispose()
        return
      }
      handDetectorRef.current = detector
      setGestureStatus("Show both open palms")

      let detecting = false
      const detectHands = async () => {
        if (!gestureStreamRef.current || detecting) return
        detecting = true
        try {
          const hands = await detector.estimateHands(video, {
            flipHorizontal: true,
            staticImageMode: false,
          })
          if (gestureStreamRef.current !== stream) return
          if (hands.length >= 2) {
            const now = performance.now()
            gestureStableSinceRef.current ??= now
            setGestureStatus("Two hands detected - hold briefly")
            if (now - gestureStableSinceRef.current > 800) {
              stopGestureControl()
              navigate("/qa")
              setNotice("Two hands detected: Q&A mode")
              return
            }
          } else {
            gestureStableSinceRef.current = null
            setGestureStatus("One hand found - show both hands")
          }
        } catch (error) {
          gestureStableSinceRef.current = null
          setGestureStatus(
            error instanceof Error
              ? `Hand detection paused: ${error.message}`
              : "Hand detection paused. Restart the gesture camera.",
          )
          return
        } finally {
          detecting = false
        }
        gestureFrameRef.current = requestAnimationFrame(detectHands)
      }
      gestureFrameRef.current = requestAnimationFrame(detectHands)
    } catch (error) {
      stopGestureControl()
      const message = describeGestureError(error)
      setGestureStatus(message)
      setNotice(message)
    } finally {
      gestureStartingRef.current = false
    }
  }
  useEffect(() => {
    if (view === "qa" && sessionPhase === "live") {
      setQaSeconds(300)
      void startQaRecording()
    } else {
      stopQaRecording()
    }
  }, [sessionPhase, view])
  useEffect(() => {
    return () => {
      stopQaRecording()
      if (qaAudioUrl) URL.revokeObjectURL(qaAudioUrl)
    }
  }, [])
  const stopLiveCaptions = () => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    setMic(false)
    setInterimCaption("")
    setCaptionStatus("idle")
    const burst = burstRef.current
    if (burst) {
      burstRef.current = null
      const points = pacePointsRef.current.map((point, index) =>
        index === burst.index ? { ...point, peak: true } : point,
      )
      pacePointsRef.current = points
      setPacePoints(points)
    }
    captionChannelRef.current?.postMessage({ type: "interim", text: "" })
    captionChannelRef.current?.postMessage({ type: "status", active: false })
    captionChannelRef.current?.postMessage({ type: "pace", wpm: null })
  }
  const startLiveCaptions = () => {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setCaptionStatus("unsupported")
      setNotice(
        "Live captions need Chrome or another Speech Recognition browser",
      )
      return
    }

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.onresult = (event) => {
      let interim = ""
      let confirmed = ""
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index]
        if (result.isFinal) confirmed += `${result[0].transcript} `
        else interim += result[0].transcript
      }
      setInterimCaption(interim.trim())
      captionChannelRef.current?.postMessage({
        type: "interim",
        text: interim.trim(),
      })
      if (confirmed.trim()) {
        const caption: CaptionEntry = {
          slide: slideRef.current,
          text: confirmed.trim(),
          capturedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        const heardAt = Date.now()
        for (const word of confirmed.trim().split(/\s+/)) {
          if (word) {
            wordsRef.current.push({ at: heardAt, slide: slideRef.current })
          }
        }
        setCaptions((items) => [...items, caption])
        captionChannelRef.current?.postMessage({ type: "caption", caption })
        handleVoiceModeCommand(confirmed)
        if (viewRef.current === "qa") {
          setQaTranscript((items) => [...items, caption])
        }
      }
    }
    recognition.onerror = (event) => {
      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        shouldListenRef.current = false
        setMic(false)
        setCaptionStatus("idle")
        setNotice("Microphone access is required for live captions")
      }
    }
    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start()
        } catch {}
      }
    }
    recognitionRef.current = recognition
    shouldListenRef.current = true
    wordsRef.current = []
    burstRef.current = null
    pacePointsRef.current = []
    paceStartedRef.current = Date.now()
    setWpm(null)
    setPacePoints([])
    captionChannelRef.current?.postMessage({ type: "pace", wpm: null })
    try {
      recognition.start()
      setMic(true)
      setCaptionStatus("listening")
      captionChannelRef.current?.postMessage({ type: "status", active: true })
      setNotice("Live captions started")
    } catch {
      setNotice("Unable to start live captions. Please try again.")
    }
  }
  const toggleCaptions = () => {
    if (sessionPhase !== "live") {
      setNotice("Start presentation before enabling live captions")
      return
    }
    if (mic) {
      stopLiveCaptions()
      return
    }
    startLiveCaptions()
  }
  const beginPresentation = () => {
    if (
      sessionPhase !== "ready" &&
      !window.confirm(
        "Start a new presentation? Current session data will be cleared.",
      )
    )
      return
    stopLiveCaptions()
    stopQaRecording()
    stopGestureControl()
    if (qaAudioUrl) URL.revokeObjectURL(qaAudioUrl)
    wordsRef.current = []
    pacePointsRef.current = []
    burstRef.current = null
    paceStartedRef.current = null
    setSeconds(0)
    setSessionEndedAt(null)
    setQaSeconds(299)
    setQaTranscript([])
    setQaAudioUrl("")
    setCaptions([])
    setInterimCaption("")
    captionChannelRef.current?.postMessage({ type: "clear" })
    setWpm(null)
    setPacePoints([])
    setSlide(1)
    setParagraph(cue[0] ?? 0)
    setTeleprompterAutoScroll(true)
    setLaser(true)
    setSessionPhase("live")
    navigate("/")
    startLiveCaptions()
  }
  const pausePresentation = () => {
    if (sessionPhase === "live") {
      setSessionPhase("paused")
      setNotice("Presentation paused — session data is preserved")
    } else if (sessionPhase === "paused") {
      setSessionPhase("live")
      setNotice("Presentation resumed")
    }
  }
  const endPresentation = () => {
    if (sessionPhase !== "live" && sessionPhase !== "paused") return
    stopLiveCaptions()
    stopQaRecording()
    stopGestureControl()
    setTeleprompterAutoScroll(false)
    captionChannelRef.current?.postMessage({ type: "clear" })
    setSessionEndedAt(new Date())
    setSessionPhase("ended")
    navigate("/")
    setNotice("Presentation ended — your session data is ready to review")
  }
  const slideCaptions = captions.filter((caption) => caption.slide === slide)
  const liveCaption = [
    slideCaptions.map((caption) => caption.text).join(" "),
    interimCaption,
  ]
    .filter(Boolean)
    .join(" ")
  const download = () => {
    const blob = new Blob(
      [
        `PresenterPlus — Finance Report\n\n${slides
          .map((title, index) => {
            const transcript = captions
              .filter((caption) => caption.slide === index + 1)
              .map((caption) => `[${caption.capturedAt}] ${caption.text}`)
              .join("\n")
            return `Slide ${String(index + 1).padStart(2, "0")} — ${title}\n${transcript || "No live caption captured for this slide."}`
          })
          .join(
            "\n\n",
          )}\n\nGenerated from ${captions.length} captured caption segment${
          captions.length === 1 ? "" : "s"
        }.`,
      ],
      { type: "text/plain" },
    )
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "PresenterPlus-session-notes.txt"
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice("Structured session notes exported")
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
      <video
        ref={gestureVideoRef}
        className={cn(
          "pointer-events-none fixed bottom-16 right-4 z-50 w-32 rounded-lg border-2 border-emerald-400 bg-slate-950 shadow-lg",
          gestureEnabled ? "block" : "hidden",
        )}
        muted
        playsInline
      />
      {view !== "audience" && (
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
              onClick={() => setHelp(false)}
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
                : view === "attention"
                  ? "Attention dashboard"
                  : view === "students"
                    ? "Students"
                    : view === "sensing"
                      ? "Pacing coach"
                      : view === "qa"
                        ? "Q&A session"
                        : view === "audience"
                          ? "Audience display"
                          : "Presenter workspace"}
            </h1>
            <div className="flex shrink-0 items-center gap-3">
              {view === "analytics" ? (
                <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      sessionPhase === "ended"
                        ? "bg-emerald-500"
                        : "bg-sky-600",
                    )}
                  />
                  {sessionPhase === "ended" && completedSessionLabel
                    ? `Completed ${completedSessionLabel}`
                    : sessionPhase === "ready"
                      ? "No completed session yet"
                      : "Session in progress"}
                  <span className="font-mono">{time(seconds)}</span>
                </span>
              ) : (
                <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      sessionPhase === "live"
                        ? "bg-red-600"
                        : sessionPhase === "paused"
                          ? "bg-amber-500"
                          : "bg-slate-300",
                    )}
                  />
                  {sessionPhase === "ready"
                    ? "Ready to present"
                    : sessionPhase === "ended"
                      ? "Session ended"
                      : sessionPhase === "paused"
                        ? "Paused"
                        : "Live"}{" "}
                  {sessionPhase !== "ready" && (
                    <span className="font-mono">{time(seconds)}</span>
                  )}
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[11px] font-semibold text-sky-700">
                AL
              </span>
            </div>
          </div>
        </header>
      )}
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
            Finance Report
          </p>
          <div
            className={cn(
              "mt-3 flex items-center gap-1.5 text-slate-500",
              metaText,
            )}
          >
            {view === "analytics" ? (
              <>
                {sessionPhase === "ended"
                  ? "Completed session"
                  : "Current session"}
                <span className="ml-auto font-mono">{time(seconds)}</span>
              </>
            ) : (
              <>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    sessionPhase === "live"
                      ? "bg-emerald-500"
                      : sessionPhase === "paused"
                        ? "bg-amber-500"
                        : "bg-slate-300",
                  )}
                />{" "}
                {sessionPhase === "ready"
                  ? "Ready to present"
                  : sessionPhase === "ended"
                    ? "Session ended"
                    : sessionPhase === "paused"
                      ? "Paused"
                      : "Live session"}
                {sessionPhase !== "ready" && (
                  <span className="ml-auto font-mono">{time(seconds)}</span>
                )}
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
            { path: "/sensing", name: "Pacing coach", icon: Activity },
            { path: "/attention", name: "Attention dashboard", icon: Gauge },
            { path: "/students", name: "Students", icon: Users },
            { path: "/qa", name: "Q&A session", icon: Mic },
            { path: "/audience", name: "Audience display", icon: Expand },
          ].map(({ path: href, name, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end
              onClick={() => {
                setSidebarOpen(false)
                setHelp(false)
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium whitespace-nowrap transition-colors",
                  navText,
                  isActive && !help
                    ? "bg-sky-100 text-sky-700"
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
          onClick={() => {
            setSidebarOpen(false)
            setHelp(false)
          }}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 font-medium",
              navText,
              isActive && !help
                ? "bg-sky-100 text-sky-700"
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
            onClick={() => {
              setHelp(true)
              setSidebarOpen(false)
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-3",
              navText,
              help
                ? "bg-sky-100 text-sky-700"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            <CircleHelp size={iconSize} /> Help & shortcuts
          </button>
          <div className="mt-4 border-t border-slate-100 px-3 pt-5">
            <span
              className={cn("flex items-center gap-2 text-slate-500", metaText)}
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
            "h-10 w-[3px] rounded-full bg-slate-300 transition-colors group-hover:bg-sky-700 group-focus-visible:bg-sky-700",
            resizingSidebar && "bg-sky-700",
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
          view === "audience" && "h-full w-full overflow-hidden",
          !stage && "lg:ml-[var(--sidebar-width)]",
        )}
      >
        <div
          className={cn(
            "flex flex-col",
            view === "audience"
              ? "h-full w-full overflow-hidden"
              : "mx-auto max-w-[1680px] gap-2.5 px-4 py-3 xl:px-5",
            view === "audience" || view === "attention" || view === "students"
              ? "h-full min-h-0 overflow-hidden"
              : "min-h-full lg:h-full lg:min-h-0",
          )}
        >
          {(view === "presenter" || view === "sensing") && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)] px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-700" />{" "}
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
                onClick={toggleCaptions}
                aria-pressed={mic}
                disabled={sessionPhase !== "live"}
                className="flex items-center gap-3 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Wave small color={mic ? "bg-sky-700" : "bg-slate-300"} />
                <span className="text-xs text-slate-600">
                  {captionStatus === "unsupported"
                    ? "Captions unavailable"
                    : mic
                      ? "Captions listening"
                      : "Start live captions"}
                </span>
              </button>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                  Vision active
                </span>
                <BatteryFull size={18} />
                <span className="font-mono text-xs">14:32</span>
              </div>
            </div>
          )}
          {(view === "presenter" || view === "sensing") && (
            <>
              {band === "idle" && (
                <div
                  role="status"
                  className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-slate-50 px-4 py-2 text-xs text-slate-500"
                >
                  <Activity size={15} /> Start live captions to measure speaking
                  rate.
                </div>
              )}
              {band === "optimal" && (
                <div
                  role="status"
                  className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-emerald-50/80 px-4 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 font-semibold text-emerald-700">
                    <Activity size={15} /> You're in a great rhythm
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {wpm} WPM. Your pace is clear, comfortable, and easy to
                    follow.
                  </span>
                </div>
              )}
              {band === "fast" && (
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-amber-50 px-4 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-amber-800">
                    <Activity size={15} /> Speaking rate too fast {wpm} WPM.
                    Take a breath and pause at commas.
                  </span>
                </div>
              )}
              {band === "slow" && (
                <div
                  role="status"
                  className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-sky-100 bg-sky-100 px-4 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 font-medium text-sky-700">
                    <Activity size={15} /> Pace is a little low {wpm} WPM. Keep
                    your energy up!
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
                        "relative aspect-video w-[min(100cqw,177.777777cqh)] max-w-full shrink-0 overflow-hidden bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-2 ring-inset",
                        band === "fast"
                          ? "ring-amber-400"
                          : band === "slow"
                            ? "ring-sky-700"
                            : band === "optimal"
                              ? "ring-emerald-500"
                              : "ring-slate-200",
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
                          <span className="relative h-5 w-5 rounded-full border border-sky-700/40 bg-sky-100 shadow-[0_0_20px_#0369a133]">
                            <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sky-700" />
                          </span>
                          <span className="ml-4 mt-2 flex items-center gap-2 rounded-md border border-sky-100 bg-white/95 px-2.5 py-2 text-[10px] text-sky-700">
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
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
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
                    if (!event.currentTarget.hasPointerCapture(event.pointerId))
                      return
                    const grid = event.currentTarget.parentElement
                    if (!grid) return
                    resizeTeleprompter(
                      grid.getBoundingClientRect().right - event.clientX,
                    )
                  }}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId))
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
                      "h-10 w-[3px] rounded-full bg-slate-300 transition-colors group-hover:bg-sky-700 group-focus-visible:bg-sky-700",
                      resizingSplit && "bg-sky-700",
                    )}
                  />
                </div>
                {view === "sensing" ? (
                  <AudiencePulse
                    wpm={wpm}
                    band={band}
                    peak={latestPeak}
                    points={pacePoints}
                    seconds={seconds}
                    slide={slide}
                    sessionPhase={sessionPhase}
                  />
                ) : (
                  <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between shrink-0 border-b border-border px-4 py-2.5">
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <BookOpen size={15} className="text-slate-500" /> Smart
                        teleprompter
                      </span>
                      <button
                        onClick={() =>
                          setTeleprompterAutoScroll((value) => !value)
                        }
                        aria-pressed={teleprompterAutoScroll}
                        title={
                          teleprompterAutoScroll
                            ? "Pause auto-scroll"
                            : "Start auto-scroll"
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium",
                          teleprompterAutoScroll
                            ? "bg-sky-100 text-sky-700"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            teleprompterAutoScroll
                              ? "bg-sky-700"
                              : "bg-slate-400",
                          )}
                        />
                        Auto-scroll
                      </button>
                    </div>
                    <div
                      tabIndex={0}
                      role="region"
                      aria-label="Teleprompter script"
                      className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {paragraph > 0 && (
                        <button
                          onClick={() => setTeleprompterPosition(paragraph - 1)}
                          className="block w-full text-left text-sm leading-relaxed text-slate-500 hover:text-slate-900"
                          title="Click to return to this line"
                        >
                          {script[paragraph - 1]}
                        </button>
                      )}
                      <button
                        onClick={() => setTeleprompterPosition(paragraph)}
                        className="relative -mx-1 block w-[calc(100%+0.5rem)] rounded-lg border-l-[3px] border-sky-700 bg-sky-100 px-3 py-2 text-left"
                        title="Keep the teleprompter on this line"
                      >
                        <span className="mb-2 block text-[10px] font-semibold tracking-[0.16em] text-sky-700">
                          YOU'RE HERE
                        </span>
                        <p className="text-[22px] font-semibold leading-[1.4]">
                          {script[paragraph]}
                        </p>
                      </button>
                      {script[paragraph + 1] && (
                        <button
                          onClick={() => setTeleprompterPosition(paragraph + 1)}
                          className="block w-full text-left text-sm leading-relaxed text-slate-600 hover:text-slate-900"
                          title="Click to jump to this line"
                        >
                          {script[paragraph + 1]}
                        </button>
                      )}
                      {script[paragraph + 2] && (
                        <button
                          onClick={() => setTeleprompterPosition(paragraph + 2)}
                          className="block w-full text-left text-sm leading-relaxed text-slate-600 hover:text-slate-900"
                          title="Click to jump to this line"
                        >
                          {script[paragraph + 2]}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[10px] text-slate-500">
                      <button
                        onClick={() => setTeleprompterPosition(paragraph + 1)}
                        className="flex items-center gap-1.5 hover:text-slate-900"
                      >
                        <Hand size={12} /> Swipe up to skip
                      </button>
                      <span className="h-3 border-l border-border" />
                      <button
                        onClick={() => setTeleprompterPosition(paragraph - 1)}
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
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    qaRecording ? "animate-pulse bg-red-600" : "bg-slate-300",
                  )}
                />{" "}
                {qaRecording
                  ? "Q&A audio recording for post-talk review"
                  : "Preparing Q&A audio recording"}
              </div>
              <span className="mb-4 rounded-full bg-sky-100 px-3 py-1 text-[11px] tracking-widest text-sky-700">
                SPACE FOR CONVERSATION
              </span>
              <h2 className="text-[28px] font-semibold tracking-[0.04em] text-sky-700">
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
                    stroke="#0369a1"
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
                  onClick={pausePresentation}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs"
                >
                  {sessionPhase === "paused" ? (
                    <Play size={14} />
                  ) : (
                    <Pause size={14} />
                  )}{" "}
                  {sessionPhase === "paused" ? "Resume" : "Pause timer"}
                </button>
                <button
                  onClick={() => setQaSeconds(qaSeconds + 60)}
                  className="rounded-lg bg-sky-100 px-4 py-2 text-xs text-sky-700"
                >
                  +1 minute
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Say “End Q&A” to return to lecture mode, or use the controls
                below.
              </p>
              <div className="mt-5 w-full max-w-xl rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-left">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                  <span>Q&A transcript bookmarks</span>
                  <span>{qaTranscript.length} captured</span>
                </div>
                <p className="mt-2 truncate text-xs text-slate-600">
                  {qaTranscript.length
                    ? qaTranscript[qaTranscript.length - 1].text
                    : "Responses captured while live captions are active will appear here."}
                </p>
                {qaAudioUrl && (
                  <audio controls className="mt-3 h-8 w-full" src={qaAudioUrl}>
                    Q&A audio playback
                  </audio>
                )}
              </div>
            </section>
          )}
          {view === "audience" && (
            <section
              id="audience-stage"
              className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-slate-950 text-white fullscreen:h-screen fullscreen:w-screen"
            >
              <div className="absolute right-6 top-4 z-10 flex items-center gap-3 text-[11px] text-slate-200">
                <span className="hidden items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/65 px-3 py-2 backdrop-blur-md sm:flex">
                  <Radio size={12} className="text-sky-300" /> AUDIENCE DISPLAY
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={download}
                    className="hidden items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/65 px-3 py-2 text-slate-100 backdrop-blur-md transition hover:bg-slate-800 sm:flex"
                  >
                    <QrCode size={13} /> Structured session notes{" "}
                    <Download size={12} />
                  </button>
                  <button
                    aria-label="Fullscreen slide"
                    onClick={() => {
                      if (document.fullscreenElement) document.exitFullscreen()
                      else document.documentElement.requestFullscreen?.()
                    }}
                    className="rounded-full border border-slate-700/60 bg-slate-900/65 p-2 text-slate-100 backdrop-blur-md transition hover:bg-slate-800"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex min-h-0 w-full flex-1 items-center justify-center p-2 [container-type:size] sm:p-4">
                <div className="aspect-video w-[min(100cqw,177.777777cqh)] overflow-hidden">
                  <Slide number={slide} />
                </div>
              </div>
              <div className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-4xl rounded-2xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md sm:bottom-6 sm:inset-x-8">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300">
                  <Mic size={12} className="text-sky-100" /> LIVE CAPTIONS{" "}
                  <span className="ml-auto">
                    {mic
                      ? interimCaption
                        ? "Listening…"
                        : "English auto-transcribed"
                      : captions.length
                        ? `${captions.length} captured segments`
                        : "Start captions in presenter view"}
                  </span>
                </div>
                <p className="overflow-hidden text-center text-lg font-medium leading-snug text-white [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-xl">
                  {liveCaption ? (
                    <>
                      <mark className="rounded bg-sky-100/95 px-2 text-slate-950">
                        {liveCaption}
                      </mark>
                    </>
                  ) : (
                    <span className="text-slate-300">
                      Captions will appear here when the presenter starts the
                      microphone.
                    </span>
                  )}
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
                    value: "135",
                    unit: "WPM",
                    dot: "bg-emerald-500",
                    status: "Target zone (120–140)",
                  },
                  {
                    label: "Filler words",
                    value: "4",
                    unit: "words",
                    dot: "bg-emerald-500",
                    status: "0.16 per min (Excellent)",
                  },
                  {
                    label: "Q&A Duration",
                    value: "05:12",
                    unit: "",
                    dot: "bg-sky-700",
                    status: "22% of session",
                  },
                  {
                    label: "Audience Engagement",
                    value: "92%",
                    unit: "",
                    dot: "bg-emerald-500",
                    status: "High (Top 10%)",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-mono text-3xl font-bold leading-none text-slate-900">
                        {stat.value}
                      </span>
                      {stat.unit && (
                        <span className="text-xs font-medium text-slate-400">
                          {stat.unit}
                        </span>
                      )}
                    </div>
                    <span className="mt-3 flex items-center gap-1.5 text-[11px]">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          stat.dot,
                        )}
                      />
                      <span className="text-slate-500">{stat.status}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="grid min-h-[410px] gap-3 lg:gap-0 lg:grid-cols-[minmax(0,1fr)_12px_var(--analytics-rail)]"
                style={
                  { "--analytics-rail": `${analyticsRail}%` } as CSSProperties
                }
              >
                <section className="flex min-h-[410px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex min-w-0 items-baseline">
                      <h2 className="text-[15px] font-semibold text-slate-900">
                        Session Pacing
                      </h2>
                      <p className="ml-2 text-xs font-normal text-slate-400">
                        {sessionPhase === "ended"
                          ? `${time(seconds)} acoustic & speed analysis`
                          : "Acoustic & speed analysis"}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#e1fcef]" />
                      Target Zone (120–140 WPM)
                    </span>
                  </div>
                  <div className="mt-8 flex">
                    <span className="flex-[50] border-b-2 border-sky-700 pb-1.5 text-xs font-semibold text-sky-700">
                      Slide 1–3 (12m)
                    </span>
                    <span className="flex-[19] border-b-2 border-slate-200 pb-1.5 text-center text-xs font-medium text-slate-500">
                      Slide 4–6
                    </span>
                    <span className="flex-[31] border-b-2 border-slate-200 pb-1.5 text-center text-xs font-medium text-slate-500">
                      Slide 7–10
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 700 286"
                    className="mt-4 min-h-0 w-full flex-1"
                    role="img"
                    aria-label="Pacing timeline with a 185 words per minute spike on the customer data slide"
                  >
                    <rect
                      x="45"
                      y="171"
                      width="625"
                      height="36"
                      fill="#e1fcef"
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
                      d="M45 177 C55 174 65 168 75 168 C86 168 97 180 108 180 C118.7 180 129.3 149 140 149 C150 149 160 160 170 160 C180.7 160 191.3 106.9 202 84 C210.3 66.1 218.7 36 227 36 C234.7 36 242.3 84.6 250 103 C260 127.1 270 151 280 160 C290 169 300 169 310 169 C321.7 169 333.3 160 345 160 C355 160 365 188 375 188 C385 188 395 172.8 405 168 C416.7 162.4 428.3 158 440 158 C450 158 460 176 470 176 C480 176 490 163 500 163 C511.7 163 523.3 180 535 180 C543.3 180 551.7 162 560 162 C571.7 162 583.3 173 595 173 C606 173 617 161 628 161 C642 161 656 170.3 670 175"
                      fill="none"
                      stroke="#0369a1"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <line
                      x1="227"
                      x2="227"
                      y1="42"
                      y2="256"
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx="227" cy="36" r="4" fill="#dc2626" />
                    <foreignObject x="128" y="6" width="180" height="20">
                      <div className="w-max rounded bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-mono leading-none text-white shadow-sm backdrop-blur-sm">
                        185 WPM (Slide 5)
                      </div>
                    </foreignObject>
                    {[
                      { x: 263.8, y: 134.7, label: "08:24 Laughter" },
                      { x: 361.8, y: 176.5, label: "12:10 Reflective pause" },
                      { x: 513.8, y: 168.8, label: "18:00 Q&A began" },
                    ].map((event) => (
                      <g key={event.label} className="group">
                        <circle
                          cx={event.x}
                          cy={event.y}
                          r="8"
                          fill="transparent"
                          className="cursor-pointer"
                        >
                          <title>{event.label}</title>
                        </circle>
                        <circle
                          cx={event.x}
                          cy={event.y}
                          r="3.5"
                          fill="white"
                          stroke="#0369a1"
                          strokeWidth="1.5"
                        />
                        <foreignObject
                          x={event.x - 58}
                          y={event.y - 26}
                          width="130"
                          height="20"
                          className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <div className="w-max rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500 shadow-sm">
                            {event.label}
                          </div>
                        </foreignObject>
                      </g>
                    ))}
                    {[0, 4, 8, 12, 16, 20, 24].map((minute, index) => (
                      <text
                        key={minute}
                        x={index === 6 ? 670 : 45 + index * 104}
                        y="274"
                        textAnchor={index === 6 ? "end" : "start"}
                        fill="#64748b"
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
                      "h-10 w-[3px] rounded-full bg-slate-300 transition-colors group-hover:bg-sky-700 group-focus-visible:bg-sky-700",
                      resizingAnalytics && "bg-sky-700",
                    )}
                  />
                </div>
                <section className="flex min-h-[410px] flex-col space-y-5 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm [scrollbar-width:thin]">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AI delivery coaching
                    </h2>
                    <div className="mt-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white p-4">
                      <div className="flex w-fit items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        <Sparkles size={11} /> AI Insight
                      </div>
                      <p className="mt-3 text-[13px] font-semibold text-slate-900">
                        Let the figures land
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                        Slow down on Slides 5–7, from customer data through
                        satisfaction, where pace hit 185 WPM. Pause after the
                        profit numbers.
                      </p>
                      <p className="mt-3 border-t border-indigo-100 pt-3 text-[13px] font-semibold text-slate-900">
                        Pause over filler words
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                        4 filler words detected (&apos;um&apos;). Replacing them
                        with silence will improve authority.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bookmarked audio highlights
                    </h2>
                    <div className="mt-3 rounded-xl border border-slate-200/60 bg-slate-50 p-3.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Q&A segment Slide 6</span>
                        <span>18:02</span>
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-slate-800">
                        Why is net profit 300 million below gross?
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
                              ? "bg-sky-700 animate-pulse"
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
                    <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                      <div className="bg-amber-500/70" style={{ flex: 12 }} />
                      <div className="bg-emerald-500" style={{ flex: 4.5 }} />
                      <div className="bg-sky-700" style={{ flex: 1.5 }} />
                    </div>
                    <div className="mt-3 space-y-3">
                      {[
                        {
                          name: "Slide 1–3 (Report open)",
                          time: "12:00 / Target 5:00",
                          swatch: "bg-amber-500/70",
                          note: "Overstayed by +7m (Took 50% of session time)",
                          noteClass: "text-slate-500",
                        },
                        {
                          name: "Slide 4–6 (The numbers)",
                          time: "4:30 / Target 5:00",
                          swatch: "bg-emerald-500",
                          note: "On Track (Balanced delivery)",
                          noteClass: "text-slate-400",
                        },
                        {
                          name: "Slide 7–10 (Close)",
                          time: "1:30 / Target 8:00",
                          swatch: "bg-sky-700",
                          note: "Rushed by -6.5m (Averaged 22s per slide)",
                          noteClass: "text-slate-500",
                        },
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-slate-800">
                              <span
                                className={cn(
                                  "h-2 w-2 shrink-0 rounded-sm",
                                  item.swatch,
                                )}
                              />
                              {item.name}
                            </span>
                            <span className="shrink-0 text-[11px] font-medium text-slate-500">
                              {item.time}
                            </span>
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
              <AudienceAttentionAnalytics />
            </>
          )}
          {(view === "attention" || view === "students") && (
            <ClassroomAttention
              mode={view === "students" ? "students" : "attention"}
            />
          )}
          {view === "sensing" && <PaceTimeline points={pacePoints} />}
          {view === "presenter" && (
            <div className="shrink-0 rounded-xl border border-border bg-white px-3 py-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Layers size={13} /> SLIDE NAVIGATOR{" "}
                  <span className="ml-2 text-slate-600">
                    {slides.length} slides
                  </span>
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
                        ? "Voice recall: Jump to Slide 3 Overall Sales Report"
                        : title
                    }
                    className="group w-[92px] shrink-0 text-left"
                  >
                    <div
                      className={cn(
                        "aspect-video overflow-hidden rounded-md border-2 transition",
                        slide === index + 1
                          ? "border-sky-700"
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
          ) : view === "attention" || view === "students" ? (
            <footer className="flex shrink-0 items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={13} /> Anonymous scores only. No names are
              stored.
            </footer>
          ) : (
            view !== "audience" && (
              <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                <div className="hidden items-center gap-2 text-[10px] text-slate-500 xl:flex">
                  <ShieldCheck size={13} />
                  <span>
                    {view === "sensing"
                      ? "Speaking rate stays on this device. Target 120–140 WPM."
                      : "Room sensing is processed on-device. No audience audio is stored."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {view !== "qa" && sessionPhase === "live" && (
                    <button
                      onClick={() => void startGestureControl()}
                      aria-pressed={gestureEnabled}
                      title={gestureStatus}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium",
                        gestureEnabled
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <Camera size={13} />
                      {gestureEnabled
                        ? "Gesture camera on"
                        : "Start gesture camera"}
                    </button>
                  )}
                  {view !== "qa" && sessionPhase === "live" && (
                    <span
                      aria-live="polite"
                      className={cn(
                        "hidden text-[10px] sm:inline",
                        gestureEnabled ? "text-emerald-700" : "text-slate-400",
                      )}
                    >
                      {gestureStatus}
                    </span>
                  )}
                  {view !== "qa" && sessionPhase === "live" && (
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
                  {sessionPhase === "ready" || sessionPhase === "ended" ? (
                    <>
                      {sessionPhase === "ended" && (
                        <button
                          onClick={() => navigate("/analytics")}
                          className="rounded-lg border border-border px-3 py-2 text-[11px] text-slate-600"
                        >
                          View analytics
                        </button>
                      )}
                      <button
                        onClick={beginPresentation}
                        className="flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        <Play size={13} />
                        {sessionPhase === "ready"
                          ? "Start presentation"
                          : "Start new presentation"}
                      </button>
                    </>
                  ) : (
                    <>
                      {view !== "qa" && (
                        <button
                          onClick={pausePresentation}
                          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px] text-slate-600"
                        >
                          {sessionPhase === "paused" ? (
                            <Play size={13} />
                          ) : (
                            <Pause size={13} />
                          )}{" "}
                          {sessionPhase === "paused"
                            ? "Resume session"
                            : "Pause session"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (view === "qa") {
                            stopQaRecording()
                            navigate("/")
                            setNotice("Lecture mode resumed")
                          } else {
                            navigate("/qa")
                            setNotice("Q&A mode started")
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[11px] text-slate-600"
                      >
                        <Mic size={13} />
                        {view === "qa" ? "End Q&A" : "Enter Q&A mode"}
                      </button>
                      <button
                        onClick={endPresentation}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        <Square size={13} /> End presentation
                      </button>
                    </>
                  )}
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
              ? "bg-sky-700"
              : view === "presenter" ||
                  view === "sensing" ||
                  view === "audience"
                ? band === "fast"
                  ? "bg-amber-500"
                  : band === "slow"
                    ? "bg-sky-700"
                    : band === "optimal"
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                : "bg-slate-600",
          )}
        />
      )}
      {help && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-20 overflow-y-auto bg-background lg:left-[var(--sidebar-width)]">
          <InteractionGuide onClose={() => setHelp(false)} />
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-sky-100 bg-white px-5 py-4 text-xs shadow-lg"
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
                    item.value ? "justify-end bg-sky-700" : "bg-slate-300",
                  )}
                >
                  <span className="h-4 w-4 rounded-full bg-white" />
                </button>
              </div>
            ))}
            <div className="border-t border-border pt-4 text-xs text-slate-500">
              Pacing target{" "}
              <span className="float-right text-emerald-700">120–140 WPM</span>
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-500">
              Demo session Microphone and vision states are simulated. No camera
              or microphone access is requested.
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
  { path: "/attention", Component: AppShell },
  { path: "/students", Component: AppShell },
  { path: "*", Component: AppShell },
])
export default function App() {
  return <RouterProvider router={router} />
}
