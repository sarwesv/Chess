import { useEffect, useRef } from 'react'

interface MoveHistoryProps {
  moves: string[]
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moves.length])

  const pairs: [string, string | undefined][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]])
  }

  return (
    <div className="move-history">
      <h3 className="move-history-title">Move History</h3>
      <div className="move-history-scroll">
        {pairs.map(([white, black], idx) => (
          <div key={idx} className="move-pair">
            <span className="move-number">{idx + 1}.</span>
            <span className="move-white">{white}</span>
            <span className="move-black">{black ?? ''}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
