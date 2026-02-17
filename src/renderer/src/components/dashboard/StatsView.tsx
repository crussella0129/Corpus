import { useState, useEffect, useMemo } from 'react'
import { BarChart3, Target, TrendingUp, Calendar } from 'lucide-react'
import { CardState } from '@shared/types'
import type { Card, DailyStats } from '@shared/types'

interface CardStateCounts {
  new: number
  learning: number
  review: number
  relearning: number
}

export function StatsView(): React.JSX.Element {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [cardCounts, setCardCounts] = useState<CardStateCounts>({ new: 0, learning: 0, review: 0, relearning: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const end = new Date().toISOString().split('T')[0]
    const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    Promise.all([
      window.api.getStatsRange(start, end),
      window.api.getCardsForReview(999)
    ]).then(([stats, cards]: [DailyStats[], Card[]]) => {
      // Normalize stats rows (may come as snake_case from SQLite)
      const normalized = (stats || []).map((s: Record<string, unknown>) => ({
        date: (s as DailyStats).date || (s as Record<string, unknown>).date as string,
        cardsReviewed: (s as DailyStats).cardsReviewed ?? (s as Record<string, unknown>).cards_reviewed as number ?? 0,
        cardsNew: (s as DailyStats).cardsNew ?? (s as Record<string, unknown>).cards_new as number ?? 0,
        timeSpentMs: (s as DailyStats).timeSpentMs ?? (s as Record<string, unknown>).time_spent_ms as number ?? 0,
        domainsTouched: []
      }))
      setDailyStats(normalized)

      const counts: CardStateCounts = { new: 0, learning: 0, review: 0, relearning: 0 }
      for (const card of cards) {
        if (card.state === CardState.New) counts.new++
        else if (card.state === CardState.Learning) counts.learning++
        else if (card.state === CardState.Review) counts.review++
        else if (card.state === CardState.Relearning) counts.relearning++
      }
      setCardCounts(counts)
      setLoading(false)
    })
  }, [])

  const totalReviews = useMemo(() => dailyStats.reduce((s, d) => s + d.cardsReviewed, 0), [dailyStats])
  const totalTime = useMemo(() => dailyStats.reduce((s, d) => s + d.timeSpentMs, 0), [dailyStats])
  const activeDays = useMemo(() => dailyStats.filter((d) => d.cardsReviewed > 0).length, [dailyStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted">Loading statistics...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Review Statistics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon={BarChart3} label="Total Reviews" value={totalReviews} color="text-accent" />
        <SummaryCard icon={Calendar} label="Active Days" value={`${activeDays}/30`} color="text-success" />
        <SummaryCard icon={TrendingUp} label="Avg / Day" value={activeDays > 0 ? Math.round(totalReviews / activeDays) : 0} color="text-warning" />
        <SummaryCard icon={Target} label="Time Spent" value={`${Math.round(totalTime / 60000)}m`} color="text-danger" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cards by state (donut chart) */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-4">Cards by State</h3>
          <DonutChart counts={cardCounts} />
        </div>

        {/* Accuracy trend */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-4">Reviews per Day</h3>
          <BarChartSVG data={dailyStats} />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}): React.JSX.Element {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <div className="text-xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────

function DonutChart({ counts }: { counts: CardStateCounts }): React.JSX.Element {
  const segments = [
    { label: 'New', count: counts.new, color: '#6366f1' },
    { label: 'Learning', count: counts.learning, color: '#f59e0b' },
    { label: 'Review', count: counts.review, color: '#22c55e' },
    { label: 'Relearning', count: counts.relearning, color: '#ef4444' }
  ]

  const total = segments.reduce((s, seg) => s + seg.count, 0)
  if (total === 0) {
    return <p className="text-sm text-text-muted text-center py-8">No cards to display.</p>
  }

  const cx = 80
  const cy = 80
  const r = 60
  const strokeWidth = 24

  let cumulative = 0
  const arcs = segments
    .filter((s) => s.count > 0)
    .map((seg) => {
      const fraction = seg.count / total
      const dashLength = 2 * Math.PI * r * fraction
      const dashGap = 2 * Math.PI * r * (1 - fraction)
      const offset = -2 * Math.PI * r * cumulative + 2 * Math.PI * r * 0.25
      cumulative += fraction
      return { ...seg, dashArray: `${dashLength} ${dashGap}`, dashOffset: offset }
    })

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-text-primary text-lg font-bold">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-text-muted text-[10px]">
          cards
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-text-secondary">{seg.label}</span>
            <span className="text-text-muted ml-auto">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────

function BarChartSVG({ data }: { data: DailyStats[] }): React.JSX.Element {
  // Build a full 30-day array, filling gaps with 0
  const dayMap = new Map(data.map((d) => [d.date, d.cardsReviewed]))
  const days: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, count: dayMap.get(key) ?? 0 })
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1)
  const chartW = 400
  const chartH = 120
  const barW = (chartW - 30) / 30
  const gap = 2

  return (
    <div className="overflow-x-auto">
      <svg width={chartW} height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 20}`}>
        {/* Y-axis labels */}
        <text x="0" y="10" className="fill-text-muted text-[9px]">{maxCount}</text>
        <text x="0" y={chartH} className="fill-text-muted text-[9px]">0</text>

        {/* Bars */}
        {days.map((day, i) => {
          const barH = maxCount > 0 ? (day.count / maxCount) * (chartH - 10) : 0
          const x = 25 + i * barW
          const y = chartH - barH
          return (
            <g key={day.date}>
              <rect
                x={x}
                y={y}
                width={Math.max(barW - gap, 1)}
                height={barH}
                rx={1}
                className="fill-accent"
                opacity={day.count > 0 ? 1 : 0.15}
              >
                <title>{`${day.date}: ${day.count} reviews`}</title>
              </rect>
            </g>
          )
        })}

        {/* X-axis labels (every 7 days) */}
        {days.filter((_, i) => i % 7 === 0).map((day, idx) => (
          <text
            key={day.date}
            x={25 + idx * 7 * barW + barW / 2}
            y={chartH + 14}
            textAnchor="middle"
            className="fill-text-muted text-[8px]"
          >
            {day.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}
