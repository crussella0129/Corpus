import { useState, useEffect } from 'react'
import { GraduationCap, Flame, Clock, Layers } from 'lucide-react'
import { ProgressRing } from './ProgressRing'
import { useNavigationStore } from '../../stores/navigationStore'
import { PILLARS } from '@shared/constants'
import type { DashboardData } from '@shared/types'

export function Dashboard(): React.JSX.Element {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigationStore((s) => s.navigate)

  useEffect(() => {
    window.api
      .getDashboardData()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!data) return <div className="text-text-muted">Failed to load dashboard</div>

  const totalCards = data.pillarProgress.reduce((sum, p) => sum + p.total, 0)
  const totalMastered = data.pillarProgress.reduce((sum, p) => sum + p.mastered, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your learning overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Due Today"
          value={data.dueToday + data.newAvailable}
          sublabel={`${data.newAvailable} new`}
          color="text-accent"
          onClick={() => navigate('review')}
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={data.streak}
          sublabel="days"
          color="text-warning"
        />
        <StatCard
          icon={Clock}
          label="Reviewed Today"
          value={data.reviewedToday}
          sublabel="cards"
          color="text-success"
        />
        <StatCard
          icon={Layers}
          label="Total Cards"
          value={totalCards}
          sublabel={`${totalMastered} mastered`}
          color="text-pillar-ai"
        />
      </div>

      {/* Start review CTA */}
      {(data.dueToday > 0 || data.newAvailable > 0) && (
        <button
          onClick={() => navigate('review')}
          className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg py-3 px-4 font-medium transition-colors text-center"
        >
          Start Review Session ({data.dueToday + data.newAvailable} cards)
        </button>
      )}

      {/* Pillar progress */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-3">Pillar Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PILLARS.map((pillar) => {
            const progress = data.pillarProgress.find((p) => p.pillarId === pillar.id)
            const total = progress?.total ?? 0
            const mastered = progress?.mastered ?? 0
            const pct = total > 0 ? Math.round((mastered / total) * 100) : 0

            return (
              <button
                key={pillar.id}
                onClick={() => navigate('pillar', { pillarId: pillar.id })}
                className="bg-bg-secondary border border-border rounded-lg p-4 flex flex-col items-center gap-2 hover:border-accent transition-colors"
              >
                <ProgressRing percentage={pct} color={pillar.color} size={48} />
                <span className="text-xs text-text-primary font-medium text-center leading-tight">
                  {pillar.name}
                </span>
                <span className="text-[10px] text-text-muted">
                  {mastered}/{total} cards
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      {data.recentActivity.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Recent Activity</h2>
          <div className="bg-bg-secondary border border-border rounded-lg divide-y divide-border">
            {data.recentActivity.map((day) => (
              <div key={day.date} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-text-secondary">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-primary">
                    {day.cardsReviewed} reviewed
                  </span>
                  {day.cardsNew > 0 && (
                    <span className="text-xs text-accent">{day.cardsNew} new</span>
                  )}
                  <span className="text-xs text-text-muted">
                    {Math.round(day.timeSpentMs / 60000)}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  onClick
}: {
  icon: React.ElementType
  label: string
  value: number
  sublabel: string
  color: string
  onClick?: () => void
}): React.JSX.Element {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      onClick={onClick}
      className={`bg-bg-secondary border border-border rounded-lg p-4 ${onClick ? 'hover:border-accent cursor-pointer' : ''} transition-colors`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-0.5">{sublabel}</div>
    </Component>
  )
}
