interface CardFrontProps {
  front: string
}

export function CardFront({ front }: CardFrontProps): React.JSX.Element {
  return (
    <div className="text-center">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-4">Question</p>
      <p className="text-lg text-text-primary leading-relaxed whitespace-pre-wrap">{front}</p>
    </div>
  )
}
