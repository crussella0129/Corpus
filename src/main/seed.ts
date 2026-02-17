import { getDb } from './db/connection'
import { PILLARS } from '../shared/constants'

interface DomainSeed {
  id: string
  pillarId: string
  name: string
  tier: number
  sortOrder: number
}

const DOMAINS: DomainSeed[] = [
  // ── Technical Mastery ──────────────────────────────────────
  // T1: Core competencies — learn Python first (your primary language),
  //     then systems/infra (where code runs), then security (how it breaks),
  //     then AI/ML (Python-heavy), then GenAI (builds on ML foundations)
  { id: 'technical-mastery/python', pillarId: 'technical-mastery', name: 'Python Ecosystem', tier: 1, sortOrder: 1 },
  { id: 'technical-mastery/systems', pillarId: 'technical-mastery', name: 'Systems & DevOps', tier: 1, sortOrder: 2 },
  { id: 'technical-mastery/security', pillarId: 'technical-mastery', name: 'Security & Pentesting', tier: 1, sortOrder: 3 },
  { id: 'technical-mastery/ai-ml', pillarId: 'technical-mastery', name: 'AI/ML/Deep Learning', tier: 1, sortOrder: 4 },
  { id: 'technical-mastery/genai', pillarId: 'technical-mastery', name: 'Generative AI & LLMs', tier: 1, sortOrder: 5 },
  // T2: Expanding toolkit — architecture first (patterns apply everywhere),
  //     then shell (daily driver), then languages by systems-closeness
  //     (C → C++ → Rust → Go), then applied domains, then maker skills.
  //     Each language domain includes official docs, stdlib refs, and ecosystem guides.
  { id: 'technical-mastery/architecture', pillarId: 'technical-mastery', name: 'Architecture & Patterns', tier: 2, sortOrder: 1 },
  { id: 'technical-mastery/shell', pillarId: 'technical-mastery', name: 'Shell & CLI', tier: 2, sortOrder: 2 },
  { id: 'technical-mastery/c', pillarId: 'technical-mastery', name: 'C', tier: 2, sortOrder: 3 },
  { id: 'technical-mastery/cpp', pillarId: 'technical-mastery', name: 'C++', tier: 2, sortOrder: 4 },
  { id: 'technical-mastery/rust', pillarId: 'technical-mastery', name: 'Rust', tier: 2, sortOrder: 5 },
  { id: 'technical-mastery/go', pillarId: 'technical-mastery', name: 'Go', tier: 2, sortOrder: 6 },
  { id: 'technical-mastery/data-eng', pillarId: 'technical-mastery', name: 'Data Engineering', tier: 2, sortOrder: 7 },
  { id: 'technical-mastery/web', pillarId: 'technical-mastery', name: 'Web Development', tier: 2, sortOrder: 8 },
  { id: 'technical-mastery/dev-boards', pillarId: 'technical-mastery', name: 'Dev Boards', tier: 2, sortOrder: 9 },
  { id: 'technical-mastery/cad', pillarId: 'technical-mastery', name: 'CAD & Digital Fabrication', tier: 2, sortOrder: 10 },
  // T3: Exploratory — creative applications of technical skill
  { id: 'technical-mastery/creative', pillarId: 'technical-mastery', name: 'Creative Computing', tier: 3, sortOrder: 1 },
  { id: 'technical-mastery/robotics', pillarId: 'technical-mastery', name: 'Robotics & Control Systems', tier: 3, sortOrder: 2 },
  { id: 'technical-mastery/audio', pillarId: 'technical-mastery', name: 'Audio & Synthesis', tier: 3, sortOrder: 3 },

  // ── Financial Intelligence ─────────────────────────────────
  // T1: Personal finance foundations before quantitative strategies
  { id: 'financial-intelligence/personal', pillarId: 'financial-intelligence', name: 'Personal Finance', tier: 1, sortOrder: 1 },
  { id: 'financial-intelligence/quant', pillarId: 'financial-intelligence', name: 'Quantitative Finance', tier: 1, sortOrder: 2 },
  // T2: Market structure context for the strategies above
  { id: 'financial-intelligence/markets', pillarId: 'financial-intelligence', name: 'Market Mechanics', tier: 2, sortOrder: 1 },

  // ── AI Symbiosis ───────────────────────────────────────────
  // T1: Literacy first (understand what AI is), then workflows (use it)
  { id: 'ai-symbiosis/literacy', pillarId: 'ai-symbiosis', name: 'AI Literacy', tier: 1, sortOrder: 1 },
  { id: 'ai-symbiosis/workflows', pillarId: 'ai-symbiosis', name: 'AI-Augmented Workflows', tier: 1, sortOrder: 2 },
  // T2: Running your own models (requires understanding from T1)
  { id: 'ai-symbiosis/local', pillarId: 'ai-symbiosis', name: 'Local & Private AI', tier: 2, sortOrder: 1 },

  // ── Cognitive Performance ──────────────────────────────────
  // T1: Learning science is the meta-skill (learn how to learn),
  //     then focus (sustain effort), then decision-making (direct effort)
  { id: 'cognitive-performance/learning', pillarId: 'cognitive-performance', name: 'Learning Science', tier: 1, sortOrder: 1 },
  { id: 'cognitive-performance/focus', pillarId: 'cognitive-performance', name: 'Focus & Deep Work', tier: 1, sortOrder: 2 },
  { id: 'cognitive-performance/decisions', pillarId: 'cognitive-performance', name: 'Decision-Making', tier: 1, sortOrder: 3 },
  // T2: Applied reasoning frameworks
  { id: 'cognitive-performance/problem-solving', pillarId: 'cognitive-performance', name: 'Problem-Solving', tier: 2, sortOrder: 1 },

  // ── Professional Excellence ────────────────────────────────
  // T1: Career strategy is the foundation for everything professional
  { id: 'professional-excellence/career', pillarId: 'professional-excellence', name: 'Career Strategy', tier: 1, sortOrder: 1 },
  // T2: Leadership before entrepreneurship (lead teams, then lead companies)
  { id: 'professional-excellence/leadership', pillarId: 'professional-excellence', name: 'Leadership & Communication', tier: 2, sortOrder: 1 },
  { id: 'professional-excellence/entrepreneurship', pillarId: 'professional-excellence', name: 'Entrepreneurship', tier: 2, sortOrder: 2 },

  // ── Physical & Mental Wellbeing ────────────────────────────
  // T1: Sleep is the foundation (recovery enables everything),
  //     then exercise (the highest-ROI health intervention)
  { id: 'physical-wellbeing/sleep', pillarId: 'physical-wellbeing', name: 'Sleep & Recovery', tier: 1, sortOrder: 1 },
  { id: 'physical-wellbeing/exercise', pillarId: 'physical-wellbeing', name: 'Exercise Science', tier: 1, sortOrder: 2 },
  // T2: Nutrition supports the physical, stress management supports the mental
  { id: 'physical-wellbeing/nutrition', pillarId: 'physical-wellbeing', name: 'Nutrition', tier: 2, sortOrder: 1 },
  { id: 'physical-wellbeing/stress', pillarId: 'physical-wellbeing', name: 'Stress Management', tier: 2, sortOrder: 2 }
]

export function seedInitialData(): void {
  const db = getDb()

  // Only seed if pillars table is empty
  const count = db.prepare('SELECT COUNT(*) as c FROM pillars').get() as { c: number }
  if (count.c > 0) return

  const seedAll = db.transaction(() => {
    // Seed pillars
    const insertPillar = db.prepare(
      'INSERT OR IGNORE INTO pillars (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)'
    )
    for (const p of PILLARS) {
      insertPillar.run(p.id, p.name, p.icon, p.color, p.sortOrder)
    }

    // Seed domains
    const insertDomain = db.prepare(
      'INSERT OR IGNORE INTO domains (id, pillar_id, name, tier, sort_order) VALUES (?, ?, ?, ?, ?)'
    )
    for (const d of DOMAINS) {
      insertDomain.run(d.id, d.pillarId, d.name, d.tier, d.sortOrder)
    }

    // Seed a few sample cards for testing
    const insertTopic = db.prepare(
      'INSERT OR IGNORE INTO topics (id, domain_id, name, sort_order) VALUES (?, ?, ?, ?)'
    )
    const insertCard = db.prepare(
      'INSERT INTO cards (topic_id, front, back, card_type) VALUES (?, ?, ?, ?)'
    )
    const insertSearch = db.prepare(
      `INSERT INTO search_index (entity_id, entity_type, title, content) VALUES (?, 'card', ?, ?)`
    )

    // Sample topic: Python Decorators
    insertTopic.run('technical-mastery/python/decorators', 'technical-mastery/python', 'Python Decorators', 1)
    insertTopic.run('technical-mastery/python/data-structures', 'technical-mastery/python', 'Data Structures', 2)
    insertTopic.run('cognitive-performance/learning/spaced-repetition', 'cognitive-performance/learning', 'Spaced Repetition', 1)

    // Sample cards
    const sampleCards = [
      {
        topicId: 'technical-mastery/python/decorators',
        front: 'What does `functools.wraps` do when applied to a decorator\'s inner function?',
        back: 'It copies the original function\'s `__name__`, `__doc__`, `__module__`, and other attributes to the wrapper function, preserving introspection and debugging capabilities.'
      },
      {
        topicId: 'technical-mastery/python/decorators',
        front: 'What is the execution order when multiple decorators are stacked on a function?',
        back: 'Decorators are applied bottom-up (closest to function first), but execute top-down when the decorated function is called. `@A\\n@B\\ndef f()` is equivalent to `f = A(B(f))`.'
      },
      {
        topicId: 'technical-mastery/python/data-structures',
        front: 'What is the average time complexity of dictionary lookup in Python?',
        back: 'O(1) average case. Python dicts use hash tables with open addressing. Worst case is O(n) due to hash collisions, but this is extremely rare with a good hash function.'
      },
      {
        topicId: 'cognitive-performance/learning/spaced-repetition',
        front: 'What is the spacing effect?',
        back: 'The spacing effect is the finding that information is better retained when study sessions are spaced out over time rather than massed together (cramming). First described by Ebbinghaus in 1885.'
      },
      {
        topicId: 'cognitive-performance/learning/spaced-repetition',
        front: 'What does FSRS stand for and how does it improve upon SM-2?',
        back: 'Free Spaced Repetition Scheduler. FSRS uses a machine learning model (DSR: Difficulty, Stability, Retrievability) to predict memory states, achieving 20-30% better scheduling efficiency than SM-2\'s fixed-interval algorithm.'
      }
    ]

    for (const card of sampleCards) {
      const result = insertCard.run(card.topicId, card.front, card.back, 'basic')
      insertSearch.run(String(result.lastInsertRowid), card.front, card.back)
    }
  })

  seedAll()
}
