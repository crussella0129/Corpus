import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useNavigationStore } from '../../stores/navigationStore'
import { Dashboard } from '../dashboard/Dashboard'
import { ReviewSession } from '../review/ReviewSession'
import type { DashboardData } from '@shared/types'

export function MainLayout(): React.JSX.Element {
  const view = useNavigationStore((s) => s.view)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    window.api.getDashboardData().then(setDashboardData)
  }, [view])

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          streak={dashboardData?.streak ?? 0}
          reviewedToday={dashboardData?.reviewedToday ?? 0}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <ViewRouter />
        </main>
      </div>
    </div>
  )
}

function ViewRouter(): React.JSX.Element {
  const { view, pillarId, domainId } = useNavigationStore()

  switch (view) {
    case 'dashboard':
      return <Dashboard />
    case 'review':
      return <ReviewSession />
    case 'pillar':
      return <PillarPlaceholder pillarId={pillarId} />
    case 'domain':
      return <DomainPlaceholder domainId={domainId} />
    case 'graph':
      return <PlaceholderView title="Knowledge Graph" description="Interactive concept map — coming in Sprint 4" />
    case 'ingest':
      return <PlaceholderView title="Add Content" description="Import from GitHub, URLs, or create manually — coming in Sprint 5" />
    case 'search':
      return <PlaceholderView title="Search" description="Full-text search across all content" />
    default:
      return <Dashboard />
  }
}

function PillarPlaceholder({ pillarId }: { pillarId: string | null }): React.JSX.Element {
  const [domains, setDomains] = useState<{ id: string; name: string; tier: number }[]>([])
  const navigate = useNavigationStore((s) => s.navigate)

  useEffect(() => {
    if (pillarId) {
      window.api.getDomains(pillarId).then(setDomains)
    }
  }, [pillarId])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {pillarId?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => (
          <button
            key={domain.id}
            onClick={() => navigate('domain', { pillarId: pillarId!, domainId: domain.id })}
            className="bg-bg-secondary border border-border rounded-lg p-4 text-left hover:border-accent transition-colors"
          >
            <h3 className="text-sm font-medium text-text-primary">{domain.name}</h3>
            <span className="text-xs text-text-muted">Tier {domain.tier}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DomainPlaceholder({ domainId }: { domainId: string | null }): React.JSX.Element {
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (domainId) {
      window.api.getTopics(domainId).then(setTopics)
    }
  }, [domainId])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {domainId?.split('/').pop()?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </h2>
      {topics.length > 0 ? (
        <div className="space-y-2">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-bg-secondary border border-border rounded-lg p-3"
            >
              <h3 className="text-sm font-medium text-text-primary">{topic.name}</h3>
              <p className="text-xs text-text-muted mt-1">{topic.id}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-muted">No topics yet. Add content to get started.</p>
      )}
    </div>
  )
}

function PlaceholderView({
  title,
  description
}: {
  title: string
  description: string
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">{title}</h2>
        <p className="text-text-muted">{description}</p>
      </div>
    </div>
  )
}
