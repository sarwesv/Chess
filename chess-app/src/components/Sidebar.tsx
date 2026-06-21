import type { Color } from 'chess.js'
import type { GameState, GameMode, Difficulty } from '../hooks/useChessGame'
import type { Orientation } from '../hooks/useCameraFlip'
import CapturedTray from './CapturedTray'
import MoveHistory from './MoveHistory'

interface SidebarProps {
  gameState: GameState
  mode: GameMode
  difficulty: Difficulty
  orientation: Orientation
  humanColor: Color
  onNewGame: () => void
  onUndo: () => void
}

const COLOR_LABEL: Record<Color, string> = { w: 'White', b: 'Black' }

export default function Sidebar({ gameState, mode, difficulty, orientation, humanColor, onNewGame, onUndo }: SidebarProps) {
  const { turn, isCheck, isCheckmate, isDraw, capturedByWhite, capturedByBlack, moveHistory } = gameState

  const statusText = (() => {
    if (isCheckmate) return `${turn === 'w' ? 'Black' : 'White'} wins by checkmate!`
    if (isDraw) return 'Draw!'
    if (isCheck) return `${COLOR_LABEL[turn]} is in check`
    return `${COLOR_LABEL[turn]} to move`
  })()

  const isGameOver = gameState.isGameOver

  const topPlayer = orientation === 'white' ? 'b' : 'w'
  const bottomPlayer = orientation === 'white' ? 'w' : 'b'

  const playerLabel = (color: Color) => {
    if (mode === 'vs-bot') {
      return color === humanColor ? 'You' : `Bot (${difficulty})`
    }
    return color === 'w' ? 'White' : 'Black'
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="chess-crown">♛</div>
        <h1 className="sidebar-title">Chess</h1>
      </div>

      {/* Top player (opponent from current view) */}
      <div className={`player-card ${turn === topPlayer && !isGameOver ? 'active' : ''}`}>
        <span className="player-color-dot" data-color={topPlayer} />
        <span className="player-name">{playerLabel(topPlayer)}</span>
        {turn === topPlayer && !isGameOver && <span className="turn-indicator">●</span>}
      </div>

      <CapturedTray
        pieces={topPlayer === 'w' ? capturedByBlack : capturedByWhite}
        label={`Captured by ${playerLabel(topPlayer)}`}
      />

      <div className={`status-banner ${isCheckmate ? 'status-checkmate' : isCheck ? 'status-check' : ''}`}>
        {statusText}
      </div>

      <MoveHistory moves={moveHistory} />

      <CapturedTray
        pieces={bottomPlayer === 'w' ? capturedByBlack : capturedByWhite}
        label={`Captured by ${playerLabel(bottomPlayer)}`}
      />

      {/* Bottom player (current player) */}
      <div className={`player-card ${turn === bottomPlayer && !isGameOver ? 'active' : ''}`}>
        <span className="player-color-dot" data-color={bottomPlayer} />
        <span className="player-name">{playerLabel(bottomPlayer)}</span>
        {turn === bottomPlayer && !isGameOver && <span className="turn-indicator">●</span>}
      </div>

      <div className="sidebar-actions">
        <button className="btn-vintage btn-primary" onClick={onNewGame}>New Game</button>
        {moveHistory.length > 0 && (
          <button className="btn-vintage btn-secondary" onClick={onUndo}>Undo</button>
        )}
      </div>
    </aside>
  )
}
