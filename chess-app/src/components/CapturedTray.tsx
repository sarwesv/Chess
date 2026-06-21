import type { PieceSymbol } from 'chess.js'

const PIECE_UNICODE: Record<PieceSymbol, string> = {
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
}

const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
}

interface CapturedTrayProps {
  pieces: PieceSymbol[]
  label: string
}

export default function CapturedTray({ pieces, label }: CapturedTrayProps) {
  const sorted = [...pieces].sort((a, b) => PIECE_VALUE[b] - PIECE_VALUE[a])
  const advantage = pieces.reduce((sum, p) => sum + PIECE_VALUE[p], 0)

  return (
    <div className="captured-tray">
      <span className="captured-label">{label}</span>
      <div className="captured-pieces">
        {sorted.map((p, i) => (
          <span key={i} className="captured-piece">{PIECE_UNICODE[p]}</span>
        ))}
        {advantage > 0 && <span className="advantage">+{advantage}</span>}
      </div>
    </div>
  )
}
