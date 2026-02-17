import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { Pillar, Domain, Topic } from '../../shared/types'

export function registerNavigationHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.PILLARS_GET_ALL, () => {
    const db = getDb()
    const rows = db
      .prepare('SELECT * FROM pillars ORDER BY sort_order')
      .all() as Record<string, unknown>[]

    return rows.map(
      (r): Pillar => ({
        id: r.id as string,
        name: r.name as string,
        icon: (r.icon as string) || '',
        color: (r.color as string) || '#6366f1',
        sortOrder: (r.sort_order as number) || 0
      })
    )
  })

  ipcMain.handle(IPC_CHANNELS.DOMAINS_GET_ALL, () => {
    const db = getDb()
    const rows = db
      .prepare('SELECT * FROM domains ORDER BY tier ASC, sort_order ASC')
      .all() as Record<string, unknown>[]
    return rows.map(rowToDomain)
  })

  ipcMain.handle(IPC_CHANNELS.DOMAINS_GET_BY_PILLAR, (_event, pillarId: string) => {
    const db = getDb()
    const rows = db
      .prepare('SELECT * FROM domains WHERE pillar_id = ? ORDER BY tier ASC, sort_order ASC')
      .all(pillarId) as Record<string, unknown>[]
    return rows.map(rowToDomain)
  })

  ipcMain.handle(IPC_CHANNELS.TOPICS_GET_ALL, () => {
    const db = getDb()
    const rows = db
      .prepare('SELECT * FROM topics ORDER BY sort_order')
      .all() as Record<string, unknown>[]
    return rows.map(rowToTopic)
  })

  ipcMain.handle(IPC_CHANNELS.TOPICS_GET_BY_DOMAIN, (_event, domainId: string) => {
    const db = getDb()
    const rows = db
      .prepare('SELECT * FROM topics WHERE domain_id = ? ORDER BY sort_order')
      .all(domainId) as Record<string, unknown>[]
    return rows.map(rowToTopic)
  })

  ipcMain.handle(IPC_CHANNELS.TOPICS_GET, (_event, topicId: string) => {
    const db = getDb()
    const row = db
      .prepare('SELECT * FROM topics WHERE id = ?')
      .get(topicId) as Record<string, unknown> | undefined
    return row ? rowToTopic(row) : null
  })
}

function rowToDomain(r: Record<string, unknown>): Domain {
  return {
    id: r.id as string,
    pillarId: r.pillar_id as string,
    name: r.name as string,
    tier: (r.tier as 1 | 2 | 3) || 2,
    sortOrder: (r.sort_order as number) || 0
  }
}

function rowToTopic(r: Record<string, unknown>): Topic {
  return {
    id: r.id as string,
    domainId: r.domain_id as string,
    name: r.name as string,
    contentPath: (r.content_path as string) || null,
    sortOrder: (r.sort_order as number) || 0
  }
}
