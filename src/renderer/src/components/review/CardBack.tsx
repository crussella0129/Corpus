interface CardBackProps {
  front: string
  back: string
}

export function CardBack({ front, back }: CardBackProps): React.JSX.Element {
  return (
    <div>
      <div className="text-center mb-6 pb-6 border-b border-border">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Question</p>
        <p className="text-text-secondary">{front}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-success uppercase tracking-wider mb-2">Answer</p>
        <p className="text-lg text-text-primary leading-relaxed whitespace-pre-wrap">{back}</p>
      </div>
    </div>
  )
}
