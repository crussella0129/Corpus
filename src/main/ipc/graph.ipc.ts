import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { IPC_CHANNELS } from '../../shared/ipc-channels'

export interface GraphNode {
  id: string
  label: string
  type: 'pillar' | 'domain' | 'topic'
  pillarId?: string
  tier?: number
  cardCount: number
  masteredCount: number
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  relation: string
  weight: number
}

export function registerGraphHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GRAPH_GET_NODES, (_event, pillarFilter?: string) => {
    const db = getDb()

    let query = `
      SELECT
        t.id, t.name as label, 'topic' as type,
        d.pillar_id,
        d.tier,
        COUNT(c.id) as card_count,
        SUM(CASE WHEN c.state = 2 THEN 1 ELSE 0 END) as mastered_count
      FROM topics t
      JOIN domains d ON t.domain_id = d.id
      LEFT JOIN cards c ON c.topic_id = t.id
    `

    const params: string[] = []
    if (pillarFilter) {
      query += ' WHERE d.pillar_id = ?'
      params.push(pillarFilter)
    }

    query += ' GROUP BY t.id'

    const rows = db.prepare(query).all(...params) as {
      id: string
      label: string
      type: string
      pillar_id: string
      tier: number
      card_count: number
      mastered_count: number
    }[]

    return rows.map(
      (r): GraphNode => ({
        id: r.id,
        label: r.label,
        type: r.type as GraphNode['type'],
        pillarId: r.pillar_id,
        tier: r.tier,
        cardCount: r.card_count || 0,
        masteredCount: r.mastered_count || 0
      })
    )
  })

  ipcMain.handle(IPC_CHANNELS.GRAPH_GET_EDGES, (_event, pillarFilter?: string) => {
    const db = getDb()

    let query = `SELECT l.id, l.source_id, l.target_id, l.relation, l.weight FROM links l`

    const params: string[] = []
    if (pillarFilter) {
      query += `
        JOIN topics ts ON l.source_id = ts.id
        JOIN domains ds ON ts.domain_id = ds.id
        WHERE ds.pillar_id = ?`
      params.push(pillarFilter)
    }

    const rows = db.prepare(query).all(...params) as {
      id: number
      source_id: string
      target_id: string
      relation: string
      weight: number
    }[]

    return rows.map(
      (r): GraphEdge => ({
        id: String(r.id),
        source: r.source_id,
        target: r.target_id,
        relation: r.relation,
        weight: r.weight
      })
    )
  })
}
