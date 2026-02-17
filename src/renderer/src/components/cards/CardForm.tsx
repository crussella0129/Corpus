import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Card } from '@shared/types'

interface CardFormProps {
  topicId: string
  card?: Card | null
  onSave: () => void
  onCancel: () => void
}

export function CardForm({ topicId, card, onSave, onCancel }: CardFormProps): React.JSX.Element {
  const [front, setFront] = useState(card?.front ?? '')
  const [back, setBack] = useState(card?.back ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFront(card?.front ?? '')
    setBack(card?.back ?? '')
  }, [card])

  const isEdit = !!card
  const isValid = front.trim().length > 0 && back.trim().length > 0

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!isValid || saving) return

    setSaving(true)
    try {
      if (isEdit) {
        await window.api.updateCard(card.id, { front: front.trim(), back: back.trim() })
      } else {
        await window.api.createCard({ topicId, front: front.trim(), back: back.trim() })
      }
      onSave()
    } catch (err) {
      console.error('Failed to save card:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-tertiary border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">
          {isEdit ? 'Edit Card' : 'New Card'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">Front (Question)</label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Enter the question..."
            rows={3}
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none resize-none"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Back (Answer)</label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Enter the answer..."
            rows={3}
            className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || saving}
          className="px-4 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
