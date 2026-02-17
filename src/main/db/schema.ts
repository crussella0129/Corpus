import { getDb } from './connection'

const SCHEMA_VERSION = 1

export function initializeSchema(): void {
  const db = getDb()

  // Create migration tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const currentVersion =
    db.prepare('SELECT MAX(version) as v FROM schema_version').get() as { v: number | null }

  if ((currentVersion?.v ?? 0) < SCHEMA_VERSION) {
    applyMigrations(currentVersion?.v ?? 0)
  }
}

function applyMigrations(fromVersion: number): void {
  const db = getDb()

  const migrate = db.transaction(() => {
    if (fromVersion < 1) {
      migrationV1()
    }
    // Future migrations go here: if (fromVersion < 2) migrationV2()
  })

  migrate()
}

function migrationV1(): void {
  const db = getDb()

  // Knowledge taxonomy
  db.exec(`
    CREATE TABLE IF NOT EXISTS pillars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      sort_order INTEGER
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      pillar_id TEXT REFERENCES pillars(id),
      name TEXT NOT NULL,
      tier INTEGER DEFAULT 2,
      sort_order INTEGER
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      domain_id TEXT REFERENCES domains(id),
      name TEXT NOT NULL,
      content_path TEXT,
      sort_order INTEGER
    )
  `)

  // Flashcards with FSRS scheduling
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id TEXT REFERENCES topics(id),
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      card_type TEXT DEFAULT 'basic',
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      stability REAL DEFAULT 0,
      difficulty REAL DEFAULT 0,
      due TEXT,
      last_review TEXT,
      reps INTEGER DEFAULT 0,
      lapses INTEGER DEFAULT 0,
      state INTEGER DEFAULT 0,
      elapsed_days REAL DEFAULT 0,
      scheduled_days REAL DEFAULT 0
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_topic ON cards(topic_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cards_state ON cards(state)`)

  // Review history
  db.exec(`
    CREATE TABLE IF NOT EXISTS review_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      review_at TEXT NOT NULL,
      elapsed_days REAL,
      scheduled_days REAL,
      state INTEGER,
      duration_ms INTEGER
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_review_logs_card ON review_logs(card_id)`)

  // Knowledge graph edges
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relation TEXT DEFAULT 'related',
      weight REAL DEFAULT 1.0
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_id)`)

  // Content ingestion tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE,
      title TEXT,
      origin TEXT,
      star_list TEXT,
      ingested_at TEXT,
      status TEXT DEFAULT 'pending'
    )
  `)

  // User progress & streaks
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      cards_reviewed INTEGER DEFAULT 0,
      cards_new INTEGER DEFAULT 0,
      time_spent_ms INTEGER DEFAULT 0,
      domains_touched TEXT
    )
  `)

  // Full-text search
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      entity_id,
      entity_type,
      title,
      content,
      tokenize='porter unicode61'
    )
  `)

  // Record migration
  db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(1)
}
