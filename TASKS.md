# Corpus — Task Tracker

## Sprint 1: Scaffold + DB + Basic UI (Week 1)
- [x] Create GitHub repo (`crussella0129/Corpus`)
- [x] Scaffold with `electron-vite` (React + TypeScript)
- [x] Install dependencies: `better-sqlite3`, `ts-fsrs`, `tailwindcss`, `zustand`, `lucide-react`
- [x] Shared types, IPC channels, constants
- [x] SQLite schema + WAL mode + migrations (v1)
- [x] FSRS scheduler (`ts-fsrs` integration)
- [x] IPC handlers: cards, review, dashboard, search, graph, navigation
- [x] Preload bridge with type-safe API
- [x] Seed data: 6 pillars, 32 domains, sample topics + cards
- [x] Sidebar, TopBar, MainLayout
- [x] Dashboard with progress rings, stats, streak display
- [x] Review session: flip cards, FSRS ratings (1-4), keyboard shortcuts
- [x] Fetch all GitHub star lists (32 lists, 667 repos → `corpus_stars_data.txt`)
- [x] Full build passing (typecheck + vite build)

## Sprint 2: Cards + FSRS Review Engine (Week 2)
- [ ] Card CRUD UI (create, edit, delete cards within topics)
- [ ] Review session improvements (session history, undo last rating)
- [ ] Review statistics page (accuracy over time, retention curves)
- [ ] Card templates (cloze deletion support)

## Sprint 3: Notes + Content Structure (Week 3)
- [ ] Markdown editor (Milkdown or MDXEditor)
- [ ] Note viewer with rendered markdown
- [ ] YAML front matter parsing for metadata
- [ ] FTS5 search results UI
- [ ] Topic detail view with notes + cards

## Sprint 4: Knowledge Graph (Week 4)
- [ ] Install Cytoscape.js
- [ ] Graph view with topics as nodes, links as edges
- [ ] Click-to-navigate from graph to topic/card
- [ ] Filter by pillar, domain, mastery level
- [ ] Layout: `cose-bilkent` for organic clustering

## Sprint 5-6: Content Ingestion (Weeks 5-6)
- [ ] GitHub repo README fetcher (README → markdown note)
- [ ] Web URL importer (readability + turndown)
- [ ] Bulk import wizard for starred repos
- [ ] Auto-classification: star list → pillar mapping

## Sprint 6-7: Advanced Learning (Weeks 7-8)
- [ ] Interleaving in review queue
- [ ] Elaborative interrogation prompts
- [ ] Feynman mode
- [ ] Project-based learning views
- [ ] Progress rings + streak tracking + heatmap calendar

## Sprint 8: Polish (Weeks 9-10)
- [ ] Cross-platform build (Windows, Mac, Linux)
- [ ] Auto-updater via electron-builder
- [ ] Keyboard shortcuts (global)
- [ ] Dark/light theme toggle
- [ ] Performance optimization (lazy loading, virtualized lists)
