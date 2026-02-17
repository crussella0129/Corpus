import { useState, useEffect } from 'react'
import {
  Code2,
  TrendingUp,
  Brain,
  Lightbulb,
  Briefcase,
  Heart,
  LayoutDashboard,
  GraduationCap,
  Network,
  Plus,
  BarChart3,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useNavigationStore } from '../../stores/navigationStore'
import type { Pillar, Domain } from '@shared/types'

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Code2,
  TrendingUp,
  Brain,
  Lightbulb,
  Briefcase,
  Heart
}

export function Sidebar(): React.JSX.Element {
  const { view, pillarId, navigate } = useNavigationStore()
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)
  const [domains, setDomains] = useState<Domain[]>([])

  useEffect(() => {
    window.api.getPillars().then(setPillars)
  }, [])

  useEffect(() => {
    if (expandedPillar) {
      window.api.getDomains(expandedPillar).then(setDomains)
    }
  }, [expandedPillar])

  const togglePillar = (id: string): void => {
    if (expandedPillar === id) {
      setExpandedPillar(null)
    } else {
      setExpandedPillar(id)
      navigate('pillar', { pillarId: id })
    }
  }

  return (
    <aside className="w-72 shrink-0 bg-bg-secondary border-r border-border flex flex-col h-full">
      {/* Logo area */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Corpus</h1>
        <p className="text-xs text-text-muted mt-0.5">Personal Knowledge System</p>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Quick links */}
        <div className="px-2 mb-4">
          <SidebarButton
            icon={LayoutDashboard}
            label="Dashboard"
            active={view === 'dashboard'}
            onClick={() => navigate('dashboard')}
          />
          <SidebarButton
            icon={GraduationCap}
            label="Review"
            active={view === 'review'}
            onClick={() => navigate('review')}
          />
          <SidebarButton
            icon={Network}
            label="Knowledge Graph"
            active={view === 'graph'}
            onClick={() => navigate('graph')}
          />
          <SidebarButton
            icon={BarChart3}
            label="Statistics"
            active={view === 'stats'}
            onClick={() => navigate('stats')}
          />
          <SidebarButton
            icon={Plus}
            label="Add Content"
            active={view === 'ingest'}
            onClick={() => navigate('ingest')}
          />
        </div>

        {/* Pillars */}
        <div className="px-2">
          <p className="text-[10px] uppercase tracking-wider text-text-muted px-3 mb-1">
            Pillars
          </p>
          {pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.icon] || Code2
            const isExpanded = expandedPillar === pillar.id
            const isActive = pillarId === pillar.id

            return (
              <div key={pillar.id}>
                <button
                  onClick={() => togglePillar(pillar.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-bg-tertiary text-text-primary'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 shrink-0" />
                  )}
                  <Icon className="w-4 h-4 shrink-0" style={{ color: pillar.color }} />
                  <span className="truncate">{pillar.name}</span>
                </button>

                {isExpanded && domains.length > 0 && (
                  <div className="ml-8 mt-0.5 mb-1 border-l border-border pl-2">
                    {domains.map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() =>
                          navigate('domain', {
                            pillarId: pillar.id,
                            domainId: domain.id
                          })
                        }
                        className="w-full text-left flex items-center justify-between px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
                      >
                        <span className="truncate">{domain.name}</span>
                        <span className="shrink-0 ml-2 text-text-muted opacity-60">T{domain.tier}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-text-muted text-center">v0.1.0</p>
      </div>
    </aside>
  )
}

function SidebarButton({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}
