import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import { useNavigationStore } from '../../stores/navigationStore'
import { CardForm } from '../cards/CardForm'
import { CardList } from '../cards/CardList'
import type { Topic, Domain, Card } from '@shared/types'

const TIER_LABELS: Record<number, string> = {
  1: 'Deep Mastery',
  2: 'Working Reference',
  3: 'Curated Links'
}

export function TopicView(): React.JSX.Element {
  const { topicId, domainId, pillarId, navigate } = useNavigationStore()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [domain, setDomain] = useState<Domain | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    if (!topicId) return
    const result = await window.api.getCardsByTopic(topicId)
    setCards(result)
  }, [topicId])

  useEffect(() => {
    if (!topicId) return

    setLoading(true)
    Promise.all([
      window.api.getTopic(topicId),
      window.api.getCardsByTopic(topicId),
      domainId ? window.api.getDomains(pillarId ?? undefined).then((domains: Domain[]) =>
        domains.find((d) => d.id === domainId) ?? null
      ) : Promise.resolve(null)
    ]).then(([t, c, d]) => {
      setTopic(t)
      setCards(c)
      setDomain(d)
      setLoading(false)
    })
  }, [topicId, domainId, pillarId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted">Loading topic...</p>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted">Topic not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
        {pillarId && (
          <>
            <button
              onClick={() => navigate('pillar', { pillarId })}
              className="hover:text-text-primary transition-colors"
            >
              {pillarId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        {domain && (
          <>
            <button
              onClick={() => navigate('domain', { pillarId: pillarId!, domainId: domain.id })}
              className="hover:text-text-primary transition-colors"
            >
              {domain.name}
            </button>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-text-secondary">{topic.name}</span>
      </nav>

      {/* Topic header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{topic.name}</h2>
          {domain && (
            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-bg-tertiary text-text-muted">
              T{domain.tier} — {TIER_LABELS[domain.tier] ?? ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {/* New card form */}
      {showForm && (
        <div className="mb-4">
          <CardForm
            topicId={topic.id}
            onSave={() => {
              setShowForm(false)
              fetchCards()
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Cards list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">
            Cards ({cards.length})
          </h3>
        </div>
        <CardList cards={cards} topicId={topic.id} onRefresh={fetchCards} />
      </div>
    </div>
  )
}
