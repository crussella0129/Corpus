import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import type { DashboardData, DailyStats } from '../../shared/types'

export function registerDashboardHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.DASHBOARD_GET_DATA, () => {
    const db = getDb()
    const now = new Date().toISOString()
    const today = now.split('T')[0]

    // Due cards
    const dueResult = db
      .prepare(
        `SELECT COUNT(*) as count FROM cards
         WHERE due IS NOT NULL AND due <= ? AND state != 0`
      )
      .get(now) as { count: number }

    // New cards available
    const newResult = db
      .prepare('SELECT COUNT(*) as count FROM cards WHERE state = 0')
      .get() as { count: number }

    // Reviewed today
    const reviewedResult = db
      .prepare(
        'SELECT cards_reviewed FROM daily_stats WHERE date = ?'
      )
      .get(today) as { cards_reviewed: number } | undefined

    // Streak
    const streak = calculateStreak(db)

    // Pillar progress
    const pillarProgress = db
      .prepare(
        `SELECT
           p.id as pillar_id,
           COUNT(c.id) as total,
           SUM(CASE WHEN c.state = 2 THEN 1 ELSE 0 END) as mastered
         FROM pillars p
         LEFT JOIN domains d ON d.pillar_id = p.id
         LEFT JOIN topics t ON t.domain_id = d.id
         LEFT JOIN cards c ON c.topic_id = t.id
         GROUP BY p.id
         ORDER BY p.sort_order`
      )
      .all() as { pillar_id: string; total: number; mastered: number }[]

    // Recent activity (last 7 days)
    const recentActivity = db
      .prepare(
        `SELECT * FROM daily_stats
         WHERE date >= date('now', '-7 days')
         ORDER BY date DESC`
      )
      .all() as {
      date: string
      cards_reviewed: number
      cards_new: number
      time_spent_ms: number
      domains_touched: string
    }[]

    const data: DashboardData = {
      dueToday: dueResult.count,
      newAvailable: newResult.count,
      reviewedToday: reviewedResult?.cards_reviewed ?? 0,
      streak,
      pillarProgress: pillarProgress.map((p) => ({
        pillarId: p.pillar_id,
        total: p.total || 0,
        mastered: p.mastered || 0
      })),
      recentActivity: recentActivity.map(
        (r): DailyStats => ({
          date: r.date,
          cardsReviewed: r.cards_reviewed,
          cardsNew: r.cards_new,
          timeSpentMs: r.time_spent_ms,
          domainsTouched: JSON.parse(r.domains_touched || '[]')
        })
      )
    }

    return data
  })

  ipcMain.handle(IPC_CHANNELS.DASHBOARD_GET_STREAK, () => {
    const db = getDb()
    return calculateStreak(db)
  })

  ipcMain.handle(IPC_CHANNELS.STATS_GET_DAILY, (_event, date: string) => {
    const db = getDb()
    return db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(date)
  })

  ipcMain.handle(IPC_CHANNELS.STATS_GET_RANGE, (_event, startDate: string, endDate: string) => {
    const db = getDb()
    return db
      .prepare('SELECT * FROM daily_stats WHERE date BETWEEN ? AND ? ORDER BY date')
      .all(startDate, endDate)
  })
}

function calculateStreak(db: import('better-sqlite3').Database): number {
  const rows = db
    .prepare(
      `SELECT date FROM daily_stats
       WHERE cards_reviewed > 0
       ORDER BY date DESC
       LIMIT 365`
    )
    .all() as { date: string }[]

  if (rows.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]

    if (rows[i].date === expectedStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}
