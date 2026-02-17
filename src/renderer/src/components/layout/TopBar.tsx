import { useState } from 'react'
import { Search, Flame } from 'lucide-react'
import { useNavigationStore } from '../../stores/navigationStore'

interface TopBarProps {
  streak: number
  reviewedToday: number
}

export function TopBar({ streak, reviewedToday }: TopBarProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    { entityId: string; entityType: string; title: string; snippet: string }[]
  >([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigationStore((s) => s.navigate)

  const handleSearch = async (query: string): Promise<void> => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const results = await window.api.search(query, 10)
      setSearchResults(results)
      setShowResults(true)
    } catch {
      setSearchResults([])
    }
  }

  const handleResultClick = (result: {
    entityId: string
    entityType: string
  }): void => {
    setShowResults(false)
    setSearchQuery('')
    if (result.entityType === 'card') {
      navigate('review')
    } else {
      navigate('topic', { topicId: result.entityId })
    }
  }

  return (
    <header className="h-12 bg-bg-secondary border-b border-border flex items-center px-4 gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search cards, notes, topics..."
          className="w-full bg-bg-tertiary border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onMouseDown={() => handleResultClick(result)}
                className="w-full text-left px-3 py-2 hover:bg-bg-hover border-b border-border last:border-0"
              >
                <div className="text-sm text-text-primary truncate">{result.title}</div>
                <div
                  className="text-xs text-text-muted truncate mt-0.5"
                  dangerouslySetInnerHTML={{ __html: result.snippet }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-text-primary">{streak}</span>
          <span className="text-xs text-text-muted">streak</span>
        </div>
        <div className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{reviewedToday}</span>
          <span className="text-text-muted"> reviewed today</span>
        </div>
      </div>
    </header>
  )
}
