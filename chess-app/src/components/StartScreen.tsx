import { useState } from 'react'
import type { Color } from 'chess.js'
import type { GameMode, Difficulty } from '../hooks/useChessGame'

interface StartScreenProps {
  onStart: (mode: GameMode, difficulty: Difficulty, humanColor: Color) => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [mode, setMode] = useState<GameMode | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [color, setColor] = useState<Color>('w')

  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="start-crown">♛</div>
        <h1 className="start-title">Chess</h1>
        <p className="start-subtitle">A classic game, timelessly rendered</p>

        {!mode ? (
          <div className="start-section">
            <h2 className="start-section-title">Choose Mode</h2>
            <div className="mode-buttons">
              <button className="btn-vintage btn-mode" onClick={() => setMode('vs-human')}>
                <span className="mode-icon">♟♟</span>
                <span>Two Players</span>
                <small>Pass & play on one device</small>
              </button>
              <button className="btn-vintage btn-mode" onClick={() => setMode('vs-bot')}>
                <span className="mode-icon">♟⚙</span>
                <span>vs Computer</span>
                <small>Challenge the machine</small>
              </button>
            </div>
          </div>
        ) : mode === 'vs-bot' ? (
          <div className="start-section">
            <h2 className="start-section-title">Your Color</h2>
            <div className="color-buttons">
              <button
                className={`btn-vintage btn-color ${color === 'w' ? 'selected' : ''}`}
                onClick={() => setColor('w')}
              >
                ♔ White
              </button>
              <button
                className={`btn-vintage btn-color ${color === 'b' ? 'selected' : ''}`}
                onClick={() => setColor('b')}
              >
                ♚ Black
              </button>
            </div>

            <h2 className="start-section-title" style={{ marginTop: '1.5rem' }}>Difficulty</h2>
            <div className="difficulty-buttons">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className={`btn-vintage btn-difficulty ${difficulty === d ? 'selected' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>

            <div className="start-actions">
              <button className="btn-vintage btn-back" onClick={() => setMode(null)}>← Back</button>
              <button className="btn-vintage btn-start" onClick={() => onStart('vs-bot', difficulty, color)}>
                Begin Game
              </button>
            </div>
          </div>
        ) : (
          <div className="start-section">
            <p className="start-note">White moves first. Pass the device after each move.</p>
            <div className="start-actions">
              <button className="btn-vintage btn-back" onClick={() => setMode(null)}>← Back</button>
              <button className="btn-vintage btn-start" onClick={() => onStart('vs-human', 'medium', 'w')}>
                Begin Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
