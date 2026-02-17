import { Rating } from '@shared/types'

interface RatingButtonsProps {
  onRate: (rating: Rating) => void
}

const RATINGS = [
  { rating: Rating.Again, label: 'Again', key: '1', color: 'bg-danger hover:bg-danger/80' },
  { rating: Rating.Hard, label: 'Hard', key: '2', color: 'bg-warning hover:bg-warning/80' },
  { rating: Rating.Good, label: 'Good', key: '3', color: 'bg-success hover:bg-success/80' },
  { rating: Rating.Easy, label: 'Easy', key: '4', color: 'bg-accent hover:bg-accent-hover' }
]

export function RatingButtons({ onRate }: RatingButtonsProps): React.JSX.Element {
  return (
    <div className="flex gap-3">
      {RATINGS.map(({ rating, label, key, color }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          className={`${color} text-white rounded-lg py-2.5 px-5 font-medium transition-colors text-sm`}
        >
          {label}
          <span className="ml-1.5 text-xs opacity-70">[{key}]</span>
        </button>
      ))}
    </div>
  )
}
