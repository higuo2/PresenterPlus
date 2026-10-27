import { useEffect, useRef, useState } from "react"
import {
  Activity,
  Clock3,
  Eye,
  Flag,
  FlagOff,
  Gauge,
  Hand,
  Play,
  Square,
  Smartphone,
  TrendingDown,
  TrendingUp,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"

type StudentRow = {
  student_id: number
  label: string
  avg_attention: number
  avg_blink_rate: number
  phone_usage_ratio: number
  hand_raised_ratio: number
  track_id?: number
  last_seen?: number
  forward_ratio?: number
  blink_total?: number
  curve: number[]
}

type NoteKind = "session_started" | "session_ended" | "phone_detected" | "phone_cleared" | "hand_raised" | "attention_dropped" | "attention_recovered" | "student_joined"

type Note = { kind: NoteKind timestamp: number title: string detail: string }

const eventIcon: Record<NoteKind, { icon: LucideIcon tone: string }> = {
  session_started: { icon: Flag, tone: "bg-indigo-500/10 text-indigo-500" },
  session_ended: { icon: FlagOff, tone: "bg-slate-100 text-slate-400" },
  phone_detected: { icon: Smartphone, tone: "bg-rose-500/10 text-rose-500" },
  phone_cleared: {
    icon: Smartphone,
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  hand_raised: { icon: Hand, tone: "bg-sky-500/10 text-sky-500" },
  attention_dropped: {
    icon: TrendingDown,
    tone: "bg-amber-500/10 text-amber-500",
  },
  attention_recovered: {
    icon: TrendingUp,
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  student_joined: { icon: UserPlus, tone: "bg-sky-500/10 text-sky-500" },
}

type Report = {
  demo: boolean
  average: number
  present: number
  phones: number
  hands: number
  blink: number
  minutes: number
  timeline: { t: number v: number }[]
  students: StudentRow[]
  events: Note[]
}

type Snap = {
  timestamp: number
  avg_attention: number
  students_present: number
  phones_visible: number
  hands_raised: number
}

const demoStudents: StudentRow[] = [
  {
    student_id: 1,
    label: "Student 1",
    avg_attention: 88.17,
    avg_blink_rate: 15.01,
    phone_usage_ratio: 0,
    hand_raised_ratio: 0.0399,
    curve: [89, 92, 95, 97, 98, 98, 98, 97, 88, 86, 82, 75, 95, 77, 83, 77],
  },
  {
    student_id: 2,
    label: "Student 2",
    avg_attention: 57.92,
    avg_blink_rate: 15.13,
    phone_usage_ratio: 0.0033,
    hand_raised_ratio: 0,
    curve: [53, 69, 63, 69, 83, 76, 74, 78, 64, 51, 51, 47, 40, 39, 47, 60],
  },
  {
    student_id: 3,
    label: "Student 3",
    avg_attention: 42.21,
    avg_blink_rate: 15.05,
    phone_usage_ratio: 0.1761,
    hand_raised_ratio: 0,
    curve: [43, 52, 49, 67, 58, 59, 54, 48, 40, 36, 26, 25, 31, 27, 30, 32],
  },
  {
    student_id: 4,
    label: "Student 4",
    avg_attention: 77.15,
    avg_blink_rate: 14.77,
    phone_usage_ratio: 0,
    hand_raised_ratio: 0.0233,
    curve: [73, 91, 84, 82, 97, 85, 84, 78, 81, 63, 64, 71, 58, 61, 67, 87],
  },
  {
    student_id: 5,
    label: "Student 5",
    avg_attention: 84.62,
    avg_blink_rate: 14.95,
    phone_usage_ratio: 0,
    hand_raised_ratio: 0.0233,
    curve: [96, 84, 96, 92, 98, 98, 98, 90, 83, 89, 80, 71, 73, 85, 70, 74],
  },
  {
    student_id: 6,
    label: "Student 6",
    avg_attention: 47.6,
    avg_blink_rate: 15.07,
    phone_usage_ratio: 0.0831,
    hand_raised_ratio: 0,
    curve: [53, 54, 66, 70, 71, 49, 59, 50, 46, 30, 40, 30, 41, 34, 36, 37],
  },
  {
    student_id: 7,
    label: "Student 7",
    avg_attention: 49.67,
    avg_blink_rate: 15.26,
    phone_usage_ratio: 0.0797,
    hand_raised_ratio: 0,
    curve: [41, 67, 55, 64, 62, 67, 70, 53, 56, 45, 31, 38, 42, 35, 52, 36],
  },
  {
    student_id: 8,
    label: "Student 8",
    avg_attention: 83.38,
    avg_blink_rate: 14.94,
    phone_usage_ratio: 0,
    hand_raised_ratio: 0.0332,
    curve: [98, 98, 98, 98, 96, 80, 89, 77, 69, 79, 78, 73, 77, 87, 76, 82],
  },
]

const demoEvents: Note[] = [
  {
    kind: "session_ended",
    timestamp: 600,
    title: "Session ended",
    detail: "301 frames analyzed",
  },
  {
    kind: "attention_recovered",
    timestamp: 504,
    title: "Attention recovered",
    detail: "Class average back to 66",
  },
  {
    kind: "attention_dropped",
    timestamp: 400,
    title: "Attention dropped",
    detail: "Class average fell to 49",
  },
  {
    kind: "phone_detected",
    timestamp: 240,
    title: "Phone detected",
    detail: "1 phone visible in class",
  },
  {
    kind: "hand_raised",
    timestamp: 120,
    title: "Hand raised",
    detail: "1 hand up",
  },
  {
    kind: "student_joined",
    timestamp: 120,
    title: "Student joined",
    detail: "8 students now present",
  },
  {
    kind: "session_started",
    timestamp: 0,
    title: "Session started",
    detail: "Demo lesson · source synthetic",
  },
]

const demoCurve = [
  64, 67, 70, 72, 69, 72, 77, 79, 80, 80, 79, 75, 81, 74, 75, 75, 72, 65, 64,
  59, 58, 57, 54, 50, 54, 53, 54, 49, 56, 54, 59, 57, 66, 64,
]

const demoReport: Report = {
  demo: true,
  average: 65.91,
  present: 8,
  events: demoEvents,
  phones: 4,
  hands: 4,
  blink: 15.02,
  minutes: 10,
  timeline: demoCurve.map((value, index) => ({
    t: (index / (demoCurve.length - 1)) * 600,
    v: value,
  })),
  students: demoStudents,
}

function smoothLine(
  values: number[],
  width: number,
  height: number,
  inset = { left: 8, right: 8, top: 8, bottom: 8 },
) {
  if (values.length === 0) return ""
  const step = Math.max(1, Math.ceil(values.length / 80))
  const sampled = values.filter((_, index) => index % step === 0)
  const last = values[values.length - 1]
  if (sampled[sampled.length - 1] !== last) sampled.push(last)
  const points = sampled.map((value, index) => {
    const x =
      sampled.length === 1
        ? (inset.left + width - inset.right) / 2
        : inset.left +
          (index / (sampled.length - 1)) * (width - inset.left - inset.right)
    const y =
      inset.top +
      (1 - Math.min(100, Math.max(0, value)) / 100) *
        (height - inset.top - inset.bottom)
    return [x, y] as const
  })
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`
  let path = `M ${points[0][0]} ${points[0][1]}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[Math.min(points.length - 1, index + 2)]
    path += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`
  }
  return path
}

function monotonePath(points: [number, number][]) {
  const count = points.length
  if (count === 0) return ""
  if (count === 1) return `M ${points[0][0]} ${points[0][1]}`
  const slope: number[] = []
  const dx: number[] = []
  for (let index = 0; index < count - 1; index += 1) {
    dx[index] = points[index + 1][0] - points[index][0] || 1
    slope[index] = (points[index + 1][1] - points[index][1]) / dx[index]
  }
  const tangent = slope.map((value, index) => {
    if (index === 0) return slope[0]
    const previous = slope[index - 1]
    return previous * value <= 0 ? 0 : (previous + value) / 2
  })
  tangent.push(slope[count - 2])
  for (let index = 0; index < count - 1; index += 1) {
    if (slope[index] === 0) {
      tangent[index] = 0
      tangent[index + 1] = 0
    } else {
      const a = tangent[index] / slope[index]
      const b = tangent[index + 1] / slope[index]
      const size = a * a + b * b
      if (size > 9) {
        const scale = 3 / Math.sqrt(size)
        tangent[index] = scale * a * slope[index]
        tangent[index + 1] = scale * b * slope[index]
      }
    }
  }
  let path = `M ${points[0][0]} ${points[0][1]}`
  for (let index = 0; index < count - 1; index += 1) {
    const span = dx[index] / 3
    const from = points[index]
    const to = points[index + 1]
    path += ` C ${from[0] + span} ${from[1] + tangent[index] * span} ${to[0] - span} ${to[1] - tangent[index + 1] * span} ${to[0]} ${to[1]}`
  }
  return path
}

type SavedSession = {
  session_id: number
  name: string
  status: string
}

function fmtClock(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remain = String(total % 60).padStart(2, "0")
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${remain}`
  return `${minutes}:${remain}`
}

function SessionBar({
  sessions,
  picked,
  onPick,
}: {
  sessions: SavedSession[]
  picked: number | null
  onPick: (id: number | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <label className="flex items-center gap-2 text-xs text-slate-500">
        Session
        <select
          value={picked ?? ""}
          onChange={(event) =>
            onPick(event.target.value ? Number(event.target.value) : null)
          }
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800"
        >
          <option value="">Demo session</option>
          {sessions.map((session) => (
            <option key={session.session_id} value={session.session_id}>
              #{session.session_id} {session.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function activityOf(
  points: Snap[],
  session: {
    name?: string
    source?: string
    ended_at?: string | null
    frames_processed?: number
    fps?: number
  } | null,
): Note[] {
  if (points.length === 0) return []
  const events: Note[] = [
    {
      kind: "session_started",
      timestamp: points[0].timestamp,
      title: "Session started",
      detail: session?.name
        ? `${session.name} · source ${session.source}`
        : "Monitoring began",
    },
  ]
  let low = false
  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1]
    const current = points[index]
    if (current.students_present > prev.students_present) {
      events.push({
        kind: "student_joined",
        timestamp: current.timestamp,
        title: "Student joined",
        detail: `${current.students_present} students now present`,
      })
    }
    if (current.phones_visible > prev.phones_visible) {
      events.push({
        kind: "phone_detected",
        timestamp: current.timestamp,
        title: "Phone detected",
        detail: `${current.phones_visible} phone${
          current.phones_visible > 1 ? "s" : ""
        } visible in class`,
      })
    } else if (current.phones_visible === 0 && prev.phones_visible > 0) {
      events.push({
        kind: "phone_cleared",
        timestamp: current.timestamp,
        title: "Phones away",
        detail: "No phones visible anymore",
      })
    }
    if (current.hands_raised > prev.hands_raised) {
      events.push({
        kind: "hand_raised",
        timestamp: current.timestamp,
        title: "Hand raised",
        detail: `${current.hands_raised} hand${
          current.hands_raised > 1 ? "s" : ""
        } up`,
      })
    }
    if (!low && current.avg_attention < 45) {
      low = true
      events.push({
        kind: "attention_dropped",
        timestamp: current.timestamp,
        title: "Attention dropped",
        detail: `Class average fell to ${Math.round(current.avg_attention)}`,
      })
    } else if (low && current.avg_attention >= 60) {
      low = false
      events.push({
        kind: "attention_recovered",
        timestamp: current.timestamp,
        title: "Attention recovered",
        detail: `Class average back to ${Math.round(current.avg_attention)}`,
      })
    }
  }
  if (session?.ended_at) {
    events.push({
      kind: "session_ended",
      timestamp: points[points.length - 1].timestamp,
      title: "Session ended",
      detail:
        session.frames_processed != null
          ? `${session.frames_processed} frames analyzed at ${(session.fps ?? 0).toFixed(1)} FPS`
          : "Recording finished",
    })
  }
  return events.reverse()
}

function band(score: number) {
  if (score >= 75) return "Excellent"
  if (score >= 55) return "Good"
  if (score >= 35) return "Low"
  return "Very low"
}

function cardTone(score: number) {
  if (score >= 75) {
    return {
      name: "Excellent",
      bar: "bg-emerald-600",
      text: "text-emerald-600",
      stroke: "stroke-emerald-600",
      badge: "bg-emerald-600/10 text-emerald-600",
    }
  }
  if (score >= 55) {
    return {
      name: "Good",
      bar: "bg-sky-500",
      text: "text-sky-500",
      stroke: "stroke-sky-500",
      badge: "bg-sky-500/10 text-sky-500",
    }
  }
  if (score >= 35) {
    return {
      name: "Warning",
      bar: "bg-amber-500",
      text: "text-amber-500",
      stroke: "stroke-amber-500",
      badge: "bg-amber-500/10 text-amber-500",
    }
  }
  return {
    name: "Critical",
    bar: "bg-rose-500",
    text: "text-rose-500",
    stroke: "stroke-rose-500",
    badge: "bg-rose-500/10 text-rose-500",
  }
}

function ScoreRing({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  const size = 52
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const tone = cardTone(clamped)
  return (
    <div
      className="relative inline-flex shrink-0"
      role="meter"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Attention ${Math.round(clamped)} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className={tone.stroke}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums ${tone.text}`}
      >
        {Math.round(clamped)}
      </span>
    </div>
  )
}

function Sparkline({ values, id }: { values: number[] id: number }) {
  if (values.length < 2) return null
  const width = 240
  const height = 40
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width
    const y = 2 + (1 - Math.min(100, Math.max(0, value)) / 100) * (height - 2)
    return [x, y] as [number, number]
  })
  const line = monotonePath(points)
  const area = `${line} L ${width} ${height} L 0 ${height} Z`
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-10 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0369a1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke="#0369a1" strokeWidth="1.5" />
    </svg>
  )
}

async function readJson(path: string) {
  const response = await fetch(path)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(String(response.status))
  return response.json()
}

let rememberedPick: number | null = null

export default function ClassroomAttention({
  mode,
}: {
  mode: "attention" | "students"
}) {
  const [report, setReport] = useState<Report | null>(demoReport)
  const [followLive, setFollowLive] = useState(false)
  const [jpeg, setJpeg] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [running, setRunning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [picked, setPickedState] = useState<number | null>(rememberedPick)
  const [reload, setReload] = useState(0)
  const runningRef = useRef(false)
  const pendingRef = useRef<"start" | "stop" | null>(null)
  const pickedRef = useRef<number | null>(null)
  const liveTail = useRef<{ t: number v: number } | null>(null)
  const curveCache = useRef<{ key: string curves: number[][] at: number }>({
    key: "",
    curves: [],
    at: 0,
  })

  function setPicked(value: number | null) {
    rememberedPick = value
    pickedRef.current = value
    setPickedState(value)
    if (value == null) setFollowLive(false)
  }
  pickedRef.current = picked

  useEffect(() => {
    let stopped = false
    let timer = 0
    async function tick() {
      try {
        const health = await fetch("/cam/health")
        if (!health.ok) throw new Error("down")
        const status = await health.json()
        if (stopped) return
        const active = status.active_session_id != null
        const pending = pendingRef.current
        const hold =
          (pending === "start" && !active) || (pending === "stop" && active)
        if (!hold) {
          runningRef.current = active
          setRunning(active)
        }
      } catch {
        // Keep the last known state if this poll misses.
      }
      if (!stopped) timer = window.setTimeout(tick, 5000)
    }
    tick()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    let stopped = false
    let timer = 0
    async function load() {
      try {
        const health = await fetch("/cam/health")
        if (!health.ok) throw new Error("down")
        const status = await health.json()
        if (stopped) return
        const activeId = status.active_session_id as number | null
        const pending = pendingRef.current
        const hold =
          (pending === "start" && activeId == null) ||
          (pending === "stop" && activeId != null)
        if (!hold) {
          runningRef.current = activeId != null
          setRunning(activeId != null)
        }
        if (picked == null && pendingRef.current !== "start" && !followLive) {
          setReport(demoReport)
          return
        }
        const key = picked == null ? "latest" : String(picked)
        const query = picked == null ? "" : `?session_id=${picked}`
        const stats = await readJson(`/cam/statistics${query}`)
        const analytics = await readJson(`/cam/analytics${query}`)
        if (stopped) return
        if (!stats || !analytics) {
          setReport(demoReport)
          return
        }
        const attendance = await readJson(`/cam/attendance${query}`)
        const students = (analytics.students ?? []) as StudentRow[]
        let curves: number[][] = []
        if (mode === "students") {
          const curveKey = `${key}:${students.map((student) => student.student_id).join(",")}`
          const fresh =
            curveCache.current.key === curveKey &&
            Date.now() - curveCache.current.at < 10000
          if (fresh) {
            curves = curveCache.current.curves
          } else {
            curves = await Promise.all(
              students.map(async (student) => {
                const points = await readJson(
                  `/cam/students/${student.student_id}/timeline${query}`,
                )
                return (points ?? []).map(
                  (point: { attention: number }) => point.attention,
                ) as number[]
              }),
            )
            curveCache.current = { key: curveKey, curves, at: Date.now() }
          }
        }
        if (stopped) return
        const snaps = (analytics.timeline ?? []) as Snap[]
        const timeline = snaps.map((point) => ({
          t: point.timestamp,
          v: point.avg_attention,
        }))
        const tail = liveTail.current
        const watchingLive =
          (activeId != null && (picked == null || picked === activeId)) ||
          (pendingRef.current === "start" && picked == null)
        if (
          tail &&
          watchingLive &&
          (timeline.length === 0 || tail.t > timeline[timeline.length - 1].t)
        ) {
          timeline.push(tail)
        }
        const blinks = students.map((student) => student.avg_blink_rate)
        setReport({
          demo: false,
          average: stats.class_average_attention,
          present: Array.isArray(attendance?.attendance)
            ? attendance.attendance.length
            : stats.students_detected,
          phones: stats.phone_incidents,
          hands: students.filter((student) => student.hand_raised_ratio > 0)
            .length,
          blink:
            blinks.length > 0
              ? blinks.reduce((sum, value) => sum + value, 0) / blinks.length
              : 0,
          minutes: snaps.length ? snaps[snaps.length - 1].timestamp / 60 : 0,
          timeline,
          events: activityOf(snaps, analytics.session ?? null),
          students: students.map((student, index) => ({
            ...student,
            curve: curves[index] ?? [],
          })),
        })
      } catch {
        if (!stopped) setReport(demoReport)
      }
    }
    async function loop() {
      await load()
      if (!stopped) {
        timer = window.setTimeout(loop, runningRef.current ? 2000 : 15000)
      }
    }
    loop()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [mode, picked, reload, followLive])

  useEffect(() => {
    if (mode !== "attention" || !running || (picked == null && !followLive)) {
      setJpeg(null)
      setLive(false)
      return
    }
    let stopped = false
    let socket: WebSocket | null = null
    let timer = 0
    const connect = () => {
      if (stopped) return
      const protocol = location.protocol === "https:" ? "wss:" : "ws:"
      socket = new WebSocket(`${protocol}//${location.host}/cam/ws/live`)
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type !== "frame") return
        if (data.jpeg_b64) {
          setLive(true)
          setJpeg(data.jpeg_b64)
        }
        const selected = pickedRef.current
        if (selected != null && selected !== data.session_id) return
        const people = (data.students ?? []) as {
          phone_visible?: boolean
          hand_raised?: boolean
        }[]
        const average = Number(data.class_average ?? 0)
        const point = { t: Number(data.timestamp ?? 0), v: average }
        const previous = liveTail.current
        if (!previous || point.t - previous.t >= 2) liveTail.current = point
        setReport((current) => {
          if (!current || current.demo) return current
          const timeline =
            liveTail.current &&
            (current.timeline.length === 0 ||
              liveTail.current.t >
                current.timeline[current.timeline.length - 1].t)
              ? [...current.timeline, liveTail.current]
              : current.timeline
          return {
            ...current,
            average,
            present: people.length,
            phones: people.filter((person) => person.phone_visible).length,
            hands: people.filter((person) => person.hand_raised).length,
            minutes: point.t / 60,
            timeline,
          }
        })
      }
      socket.onclose = () => {
        setLive(false)
        if (!stopped) timer = window.setTimeout(connect, 2000)
      }
    }
    connect()
    return () => {
      stopped = true
      window.clearTimeout(timer)
      socket?.close()
    }
  }, [mode, running, picked, followLive])

  async function control(action: "start" | "stop") {
    if (busy) return
    pendingRef.current = action
    setFollowLive(action === "start")
    const next = action === "start"
    runningRef.current = next
    setRunning(next)
    if (!next) {
      setLive(false)
      setJpeg(null)
      liveTail.current = null
    }
    setReload((value) => value + 1)
    setBusy(true)
    const response = await fetch(`/cam/stream/${action}`, {
      method: "POST",
      headers:
        action === "start" ? { "Content-Type": "application/json" } : undefined,
      body:
        action === "start"
          ? JSON.stringify({ source: 0, session_name: "Live session" })
          : undefined,
    }).catch(() => null)
    setBusy(false)
    const failed =
      !response ||
      (action === "start" && !response.ok && response.status !== 409) ||
      (action === "stop" && !response.ok)
    pendingRef.current = null
    if (failed && action === "start") {
      runningRef.current = false
      setRunning(false)
      setFollowLive(false)
      setLive(false)
      setJpeg(null)
      return
    }
    if (failed) return
    setReload((value) => value + 1)
  }

  if (!report) return null

  if (mode === "students") {
    return (
      <section className="min-h-0 flex-1 overflow-y-auto">
        <SessionBar sessions={[]} picked={picked} onPick={setPicked} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {report.students.map((student) => {
            const tone = cardTone(student.avg_attention)
            const forward = student.forward_ratio ?? 0
            return (
              <article
                key={student.student_id}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span
                  className={`absolute inset-x-0 top-0 h-0.5 opacity-70 ${tone.bar}`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {student.label}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Track #{student.track_id ?? student.student_id} · last
                        seen {fmtClock(student.last_seen ?? 0)}
                      </p>
                    </div>
                  </div>
                  <ScoreRing value={student.avg_attention} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ${tone.badge}`}
                  >
                    {tone.name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium leading-4 text-slate-500">
                    {forward >= 0.5 ? "↑" : "↓"} {Math.round(forward * 100)}%
                    forward
                  </span>
                  {student.phone_usage_ratio > 0.02 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium leading-4 text-rose-500">
                      <Smartphone className="h-3 w-3" />
                      {Math.round(student.phone_usage_ratio * 100)}%
                    </span>
                  )}
                  {student.hand_raised_ratio > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium leading-4 text-sky-500">
                      <Hand className="h-3 w-3" /> raised
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium leading-4 text-slate-500">
                    <Eye className="h-3 w-3" /> {student.blink_total ?? 0}{" "}
                    blinks
                  </span>
                </div>
                <Sparkline values={student.curve} id={student.student_id} />
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  const charts = report
  const bandStyle = {
    Excellent: { dot: "bg-emerald-500", bar: "bg-emerald-500" },
    Good: { dot: "bg-sky-500", bar: "bg-sky-500" },
    Low: { dot: "bg-amber-400", bar: "bg-amber-400" },
    "Very low": { dot: "bg-rose-500", bar: "bg-rose-500" },
  } as const
  const bandTotal = Math.max(1, charts.students.length || charts.present)
  const bands = ["Excellent", "Good", "Low", "Very low"].map((label) => {
    const count = charts.students.filter(
      (student) => band(student.avg_attention) === label,
    ).length
    return {
      label: label as keyof typeof bandStyle,
      count,
      percent: Math.round((count / bandTotal) * 100),
      ...bandStyle[(label as keyof typeof bandStyle)],
    }
  })
  const bandMax = Math.max(1, ...bands.map((item) => item.count))
  const chart = {
    width: 1200,
    height: 270,
    left: 34,
    right: 12,
    top: 10,
    bottom: 32,
  }
  const plotWidth = chart.width - chart.left - chart.right
  const plotHeight = chart.height - chart.top - chart.bottom
  const yFor = (value: number) => chart.top + (1 - value / 100) * plotHeight
  const source = charts.timeline
  const series =
    source.length <= 800
      ? source
      : source.filter(
          (_, index) => index % Math.ceil(source.length / 800) === 0,
        )
  if (
    series.length > 0 &&
    series[series.length - 1] !== source[source.length - 1]
  ) {
    series.push(source[source.length - 1])
  }
  const start = series[0]?.t ?? 0
  const end = series[series.length - 1]?.t ?? 0
  const span = end - start
  const xAt = (time: number) =>
    span <= 0 ? chart.left : chart.left + ((time - start) / span) * plotWidth
  const plotted = series.map((point) => {
    const y = yFor(Math.min(100, Math.max(0, point.v)))
    return [xAt(point.t), y] as [number, number]
  })
  const line = monotonePath(plotted)
  const area =
    plotted.length > 1
      ? `${line} L ${plotted[plotted.length - 1][0]} ${yFor(0)} L ${plotted[0][0]} ${yFor(0)} Z`
      : ""
  const xMarks: { x: number label: string }[] = []
  for (const point of series) {
    const x = xAt(point.t)
    const previous = xMarks[xMarks.length - 1]
    if (!previous || x - previous.x >= 64)
      xMarks.push({ x, label: fmtClock(point.t) })
  }
  if (xMarks.length > 0) {
    const last = xMarks[xMarks.length - 1]
    if (chart.left + plotWidth - last.x > 24) {
      xMarks.push({ x: chart.left + plotWidth, label: fmtClock(end) })
    } else {
      last.label = fmtClock(end)
      last.x = chart.left + plotWidth
    }
  }
  const metrics = [
    {
      label: "Avg attention",
      value: String(Math.round(report.average)),
      unit: "%",
      icon: Gauge,
    },
    { label: "Present", value: String(report.present), unit: "", icon: Users },
    {
      label: "Phone usage",
      value: String(report.phones),
      unit: "",
      icon: Smartphone,
    },
    { label: "Hand raises", value: String(report.hands), unit: "", icon: Hand },
    {
      label: "Blink rate",
      value: report.blink.toFixed(1),
      unit: "/min",
      icon: Eye,
    },
    {
      label: "Duration",
      value: report.minutes.toFixed(1),
      unit: "min",
      icon: Clock3,
    },
  ]

  const showingCamera = running && !report.demo

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <SessionBar sessions={[]} picked={picked} onPick={setPicked} />
      <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <metric.icon size={13} /> {metric.label}
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-bold leading-none text-slate-900">
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-xs font-medium text-slate-400">
                  {metric.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span
                className={`h-2 w-2 rounded-full ${
                  showingCamera && live
                    ? "animate-pulse bg-emerald-500"
                    : "bg-slate-300"
                }`}
              />
              {showingCamera ? (live ? "Live" : "Connecting…") : "Idle"}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => control(showingCamera ? "stop" : "start")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60 ${
                showingCamera ? "bg-rose-500" : "bg-sky-700"
              }`}
            >
              {showingCamera ? <Square size={12} /> : <Play size={12} />}
              {showingCamera ? "Stop session" : "Start stream"}
            </button>
          </div>
          <div className="flex aspect-video items-center justify-center bg-white">
            {showingCamera && jpeg ? (
              <img
                src={`data:image/jpeg;base64,${jpeg}`}
                alt="Live classroom frame"
                className="h-full w-full object-contain"
              />
            ) : (
              <p className="text-sm text-slate-400">
                {showingCamera ? "Waiting for a frame." : "No live session"}
              </p>
            )}
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
              <Activity size={16} className="text-slate-400" /> Activity
            </h2>
            {report.minutes > 0 && (
              <span className="text-[11px] tabular-nums text-slate-400">
                {fmtClock(report.minutes * 60)} elapsed
              </span>
            )}
          </div>
          <ol
            className="mt-3 max-h-72 space-y-1 overflow-y-auto"
            aria-label="Session activity timeline"
          >
            {report.events.map((event, index) => {
              const meta = eventIcon[event.kind]
              const Icon = meta.icon
              return (
                <li
                  key={`${event.kind}-${event.timestamp}-${index}`}
                  className="relative flex gap-3 rounded-xl px-2 py-2"
                >
                  {index < report.events.length - 1 && (
                    <span className="absolute left-[22px] top-10 h-[calc(100%-16px)] w-px bg-slate-200" />
                  )}
                  <span
                    className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.tone}`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {event.title}
                      </p>
                      <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                        {fmtClock(event.timestamp)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-400">
                      {event.detail}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-[15px] font-semibold text-slate-900">
          Attention over time
        </h2>
        <p className="text-xs text-slate-400">
          Class average across the session, alert dips highlighted
        </p>
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="mt-2 w-full"
          role="img"
          aria-label="Class attention over time"
        >
          <defs>
            <linearGradient id="attn-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1={chart.left}
                x2={chart.width - chart.right}
                y1={yFor(value)}
                y2={yFor(value)}
                stroke="#e2e8f0"
                strokeDasharray="3 6"
              />
              <text
                x={chart.left - 8}
                y={yFor(value) + 3}
                textAnchor="end"
                fill="#64748b"
                fontSize="11"
              >
                {value}
              </text>
            </g>
          ))}
          {xMarks.map((mark, index) => (
            <text
              key={mark.x}
              x={mark.x}
              y={chart.height - 4}
              textAnchor={
                index === 0
                  ? "start"
                  : index === xMarks.length - 1
                    ? "end"
                    : "middle"
              }
              fill="#64748b"
              fontSize="11"
            >
              {mark.label}
            </text>
          ))}
          {area && <path d={area} fill="url(#attn-fill)" stroke="none" />}
          {line && (
            <path
              d={line}
              fill="none"
              stroke="#0369a1"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </svg>
      </section>
      <div className="grid auto-rows-fr gap-3 lg:grid-cols-2">
        <section className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Attention distribution
          </h2>
          <p className="text-xs text-slate-400">
            How many students fall in each engagement band
          </p>
          <ul className="mt-5 flex flex-1 flex-col justify-center gap-3">
            {bands.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600"
              >
                <span className="flex w-24 shrink-0 items-center gap-2 font-medium">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  {item.label}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                  <span
                    className={`block h-full rounded-full ${item.bar}`}
                    style={{ width: `${(item.count / bandMax) * 100}%` }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-slate-500">
                  {item.count} ({item.percent}%)
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Phone usage
          </h2>
          <p className="text-xs text-slate-400">
            Share of students with a phone detected
          </p>
          {(() => {
            const total = charts.students.length || charts.present
            const withPhone = charts.students.filter(
              (student) => student.phone_usage_ratio > 0.02,
            ).length
            const phonePct = total ? Math.round((withPhone / total) * 100) : 0
            const freePct = 100 - phonePct
            const radius = 42
            const circumference = 2 * Math.PI * radius
            return (
              <div className="mt-5 grid flex-1 grid-cols-2 items-center gap-6">
                <div className="relative flex justify-center">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-40 w-40"
                    role="img"
                    aria-label={`${phonePct}% phone usage`}
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="18"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#0369a1"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeDasharray={`${(phonePct / 100) * circumference} ${circumference}`}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold leading-none text-slate-900">
                      {phonePct}%
                    </span>
                    <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      on phone
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="rounded-xl bg-sky-50 px-3 py-2.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-700" />
                        On phone
                      </span>
                      <b className="font-mono text-slate-800">{phonePct}%</b>
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {withPhone} of {total} students
                    </span>
                  </li>
                  <li className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                        Phone-free
                      </span>
                      <b className="font-mono text-slate-800">{freePct}%</b>
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {Math.max(0, total - withPhone)} of {total} students
                    </span>
                  </li>
                </ul>
              </div>
            )
          })()}
        </section>
      </div>
    </div>
  )
}
