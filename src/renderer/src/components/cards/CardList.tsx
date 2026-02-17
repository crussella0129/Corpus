import { useState } from 'react'
import { Pencil, Trash2, Clock, GraduationCap, BookOpen, RotateCcw } from 'lucide-react'
import { CardForm } from './CardForm'
import { CardState } from '@shared/types'
import type { Card } from '@shared/types'

interface CardListProps {
  cards: Card[]
  topicId: string
  onRefresh: () => void
}

const STATE_CONFIG: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  [CardState.New]: { label: 'New', color: 'text-accent', icon: BookOpen },
  [CardState.Learning]: { label: 'Learning', color: 'text-warning', icon: Clock },
  [CardState.Review]: { label: 'Review', color: 'text-success', icon: GraduationCap },
  [CardState.Relearning]: { label: 'Relearning', color: 'text-danger', icon: RotateCcw }
}

export function CardList({ cards, topicId, onRefresh }: CardListProps): React.JSX.Element {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number): Promise<void> => {
    try {
      await window.api.deleteCard(id)
      setDeletingId(null)
      onRefresh()
    } catch (err) {
      console.error('Failed to delete card:', err)
    }
  }

  if (cards.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4">
        No cards yet. Create one to get started.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {cards.map((card) => {
        const stateInfo = STATE_CONFIG[card.state] ?? STATE_CONFIG[CardState.New]
        const StateIcon = stateInfo.icon

        if (editingId === card.id) {
          return (
            <CardForm
              key={card.id}
              topicId={topicId}
              card={card}
              onSave={() => {
                setEditingId(null)
                onRefresh()
              }}
              onCancel={() => setEditingId(null)}
            />
          )
        }

        return (
          <div
            key={card.id}
            className="bg-bg-secondary border border-border rounded-lg p-3 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary line-clamp-2">{card.front}</p>
                <p className="text-xs text-text-muted mt-1 line-clamp-1">{card.back}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* State badge */}
                <span className={`flex items-center gap-1 text-[10px] ${stateInfo.color}`}>
                  <StateIcon className="w-3 h-3" />
                  {stateInfo.label}
                </span>

                {/* Due date */}
                {card.due && (
                  <span className="text-[10px] text-text-muted">
                    {formatDue(card.due)}
                  </span>
                )}

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(card.id)}
                    className="p-1 text-text-muted hover:text-text-primary transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {deletingId === card.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="px-1.5 py-0.5 text-[10px] bg-danger text-white rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-1.5 py-0.5 text-[10px] text-text-muted hover:text-text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(card.id)}
                      className="p-1 text-text-muted hover:text-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatDue(due: string): string {
  const d = new Date(due)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays}d`
}
