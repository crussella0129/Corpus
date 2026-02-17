import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

export interface SearchResult {
  entityId: string
  entityType: 'card' | 'note' | 'topic'
  title: string
  snippet: string
  rank: number
}

export function registerSearchHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SEARCH_QUERY, (_event, query: string, limit: number = 20) => {
    if (!query || query.trim().length === 0) return []

    const db = getDb()

    // FTS5 query with snippet extraction
    const results = db
      .prepare(
        `SELECT
           entity_id,
           entity_type,
           title,
           snippet(search_index, 3, '<mark>', '</mark>', '...', 32) as snippet,
           rank
         FROM search_index
         WHERE search_index MATCH ?
         ORDER BY rank
         LIMIT ?`
      )
      .all(query, limit) as {
      entity_id: string
      entity_type: string
      title: string
      snippet: string
      rank: number
    }[]

    return results.map(
      (r): SearchResult => ({
        entityId: r.entity_id,
        entityType: r.entity_type as SearchResult['entityType'],
        title: r.title,
        snippet: r.snippet,
        rank: r.rank
      })
    )
  })
}
