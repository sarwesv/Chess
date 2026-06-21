import { useEffect, useCallback, useRef, useState } from 'react'
import type { Square, Color } from 'chess.js'
import ChessScene from './components/ChessScene'
import Sidebar from './components/Sidebar'
import StartScreen from './components/StartScreen'
import { useChessGame } from './hooks/useChessGame'
import type { GameMode, Difficulty } from './hooks/useChessGame'
import { useCameraFlip } from './hooks/useCameraFlip'
import { useStockfish } from './hooks/useStockfish'

export default function App() {
  const { gameState, mode, difficulty, humanColor, selectSquare, applyBotMove, newGame, undoMove } = useChessGame()
  const { orientation, isFlipping, flip } = useCameraFlip()
  const { requestMove } = useStockfish()
  const botThinking = useRef(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768)

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (gameState.isGameOver) return
      if (mode === 'vs-bot' && gameState.turn !== humanColor) return
      if (botThinking.current) return

      const result = selectSquare(square)
      if (result?.moved) {
        if (mode === 'vs-human') {
          const nextTurn: Color = gameState.turn === 'w' ? 'b' : 'w'
          flip(nextTurn)
        }
      }
    },
    [gameState, mode, humanColor, selectSquare, flip]
  )

  // Bot move trigger
  useEffect(() => {
    if (mode !== 'vs-bot') return
    if (gameState.isGameOver) return
    if (gameState.turn === humanColor) return
    if (botThinking.current) return

    botThinking.current = true
    requestMove(gameState.fen, difficulty, (from, to) => {
      applyBotMove(from, to)
      botThinking.current = false
      flip(humanColor)
    })
  }, [gameState.fen, gameState.turn, mode, humanColor, difficulty, requestMove, applyBotMove, flip, gameState.isGameOver])

  const handleNewGame = useCallback(() => {
    newGame('menu')
    flip('w')
    botThinking.current = false
  }, [newGame, flip])

  const handleStart = useCallback(
    (m: GameMode, d: Difficulty, c: Color) => {
      newGame(m, d, c)
      flip(c === 'w' ? 'w' : 'b')
      botThinking.current = false
    },
    [newGame, flip]
  )

  if (mode === 'menu') {
    return <StartScreen onStart={handleStart} />
  }

  return (
    <div className="app-layout">
      <div className="scene-container">
        <ChessScene
          gameState={gameState}
          orientation={orientation}
          isFlipping={isFlipping}
          onSquareClick={handleSquareClick}
        />
        {gameState.isGameOver && (
          <div className="game-over-overlay">
            <div className="game-over-card">
              <div className="game-over-icon">
                {gameState.isCheckmate ? '♛' : '½'}
              </div>
              <h2 className="game-over-title">
                {gameState.isCheckmate
                  ? `${gameState.turn === 'w' ? 'Black' : 'White'} Wins!`
                  : 'Draw'}
              </h2>
              <button className="btn-vintage btn-start" onClick={handleNewGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <Sidebar
        gameState={gameState}
        mode={mode}
        difficulty={difficulty}
        orientation={orientation}
        humanColor={humanColor}
        onNewGame={handleNewGame}
        onUndo={undoMove}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
    </div>
  )
}
