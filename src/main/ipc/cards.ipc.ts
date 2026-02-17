import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { Card } from '../../shared/types'

function rowToCard(row: Record<string, unknown>): Card {
  return {
    id: row.id as number,
    topicId: row.topic_id as string,
    front: row.front as string,
    back: row.back as string,
    cardType: (row.card_type as 'basic' | 'cloze') || 'basic',
    imageUrl: (row.image_url as string) || null,
    createdAt: row.created_at as string,
    stability: (row.stability as number) || 0,
    difficulty: (row.difficulty as number) || 0,
    due: (row.due as string) || null,
    lastReview: (row.last_review as string) || null,
    reps: (row.reps as number) || 0,
    lapses: (row.lapses as number) || 0,
    state: (row.state as number) || 0,
    elapsedDays: (row.elapsed_days as number) || 0,
    scheduledDays: (row.scheduled_days as number) || 0
  }
}

export function registerCardHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.CARDS_GET_DUE,
    (_event, limit: number = 50) => {
      const db = getDb()
      const now = new Date().toISOString()
      const rows = db
        .prepare(
          `SELECT * FROM cards
           WHERE (due IS NULL AND state = 0) OR (due <= ?)
           ORDER BY CASE WHEN state = 0 THEN 1 ELSE 0 END, due ASC
           LIMIT ?`
        )
        .all(now, limit) as Record<string, unknown>[]
      return rows.map(rowToCard)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CARDS_GET_BY_TOPIC,
    (_event, topicId: string) => {
      const db = getDb()
      const rows = db
        .prepare('SELECT * FROM cards WHERE topic_id = ? ORDER BY created_at')
        .all(topicId) as Record<string, unknown>[]
      return rows.map(rowToCard)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CARDS_CREATE,
    (
      _event,
      data: { topicId: string; front: string; back: string; cardType?: string }
    ) => {
      const db = getDb()
      const result = db
        .prepare(
          `INSERT INTO cards (topic_id, front, back, card_type) VALUES (?, ?, ?, ?)`
        )
        .run(data.topicId, data.front, data.back, data.cardType || 'basic')

      // Index for FTS
      db.prepare(
        `INSERT INTO search_index (entity_id, entity_type, title, content)
         VALUES (?, 'card', ?, ?)`
      ).run(String(result.lastInsertRowid), data.front, data.back)

      return result.lastInsertRowid
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CARDS_UPDATE,
    (_event, id: number, data: Partial<{ front: string; back: string; topicId: string }>) => {
      const db = getDb()
      const sets: string[] = []
      const values: unknown[] = []

      if (data.front !== undefined) {
        sets.push('front = ?')
        values.push(data.front)
      }
      if (data.back !== undefined) {
        sets.push('back = ?')
        values.push(data.back)
      }
      if (data.topicId !== undefined) {
        sets.push('topic_id = ?')
        values.push(data.topicId)
      }

      if (sets.length === 0) return false
      values.push(id)

      db.prepare(`UPDATE cards SET ${sets.join(', ')} WHERE id = ?`).run(...values)

      // Update FTS index
      if (data.front !== undefined || data.back !== undefined) {
        db.prepare(
          `DELETE FROM search_index WHERE entity_id = ? AND entity_type = 'card'`
        ).run(String(id))
        const card = db.prepare('SELECT front, back FROM cards WHERE id = ?').get(id) as {
          front: string
          back: string
        }
        if (card) {
          db.prepare(
            `INSERT INTO search_index (entity_id, entity_type, title, content)
             VALUES (?, 'card', ?, ?)`
          ).run(String(id), card.front, card.back)
        }
      }

      return true
    }
  )

  ipcMain.handle(IPC_CHANNELS.CARDS_DELETE, (_event, id: number) => {
    const db = getDb()
    db.prepare('DELETE FROM search_index WHERE entity_id = ? AND entity_type = ?').run(
      String(id),
      'card'
    )
    db.prepare('DELETE FROM cards WHERE id = ?').run(id)
    return true
  })

  ipcMain.handle(IPC_CHANNELS.CARDS_COUNT, () => {
    const db = getDb()
    const result = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number }
    return result.count
  })
}
