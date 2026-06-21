import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import type { Square, PieceSymbol, Color } from 'chess.js'

export type GameMode = 'menu' | 'vs-human' | 'vs-bot'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface PieceInfo {
  type: PieceSymbol
  color: Color
  square: Square
}

export interface GameState {
  fen: string
  turn: Color
  selectedSquare: Square | null
  legalMoves: Square[]
  isCheck: boolean
  isCheckmate: boolean
  isDraw: boolean
  isGameOver: boolean
  capturedByWhite: PieceSymbol[]
  capturedByBlack: PieceSymbol[]
  moveHistory: string[]
  lastMove: { from: Square; to: Square } | null
}

export function useChessGame() {
  const [chess] = useState(() => new Chess())
  const [gameState, setGameState] = useState<GameState>(() => buildState(chess, null, null, [], []))
  const [mode, setMode] = useState<GameMode>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [humanColor, setHumanColor] = useState<Color>('w')

  const refreshState = useCallback(
    (
      game: Chess,
      selected: Square | null,
      lastMove: { from: Square; to: Square } | null,
      capturedByWhite: PieceSymbol[],
      capturedByBlack: PieceSymbol[]
    ) => {
      setGameState(buildState(game, selected, lastMove, capturedByWhite, capturedByBlack))
    },
    []
  )

  const selectSquare = useCallback(
    (square: Square) => {
      const piece = chess.get(square)
      const currentSelected = gameState.selectedSquare

      // If a square is already selected, try to move
      if (currentSelected) {
        if (gameState.legalMoves.includes(square)) {
          const move = chess.move({ from: currentSelected, to: square, promotion: 'q' })
          if (move) {
            const [capturedByWhite, capturedByBlack] = updateCaptured(
              gameState.capturedByWhite,
              gameState.capturedByBlack,
              move
            )
            refreshState(chess, null, { from: currentSelected, to: square }, capturedByWhite, capturedByBlack)
            return { moved: true, from: currentSelected, to: square }
          }
        }
        // Click on own piece — reselect
        if (piece && piece.color === chess.turn()) {
          refreshState(chess, square, gameState.lastMove, gameState.capturedByWhite, gameState.capturedByBlack)
          return { moved: false }
        }
        // Click elsewhere — deselect
        refreshState(chess, null, gameState.lastMove, gameState.capturedByWhite, gameState.capturedByBlack)
        return { moved: false }
      }

      // No selection yet — select if own piece
      if (piece && piece.color === chess.turn()) {
        refreshState(chess, square, gameState.lastMove, gameState.capturedByWhite, gameState.capturedByBlack)
      }
      return { moved: false }
    },
    [chess, gameState, refreshState]
  )

  const applyBotMove = useCallback(
    (from: Square, to: Square) => {
      const move = chess.move({ from, to, promotion: 'q' })
      if (move) {
        const [capturedByWhite, capturedByBlack] = updateCaptured(
          gameState.capturedByWhite,
          gameState.capturedByBlack,
          move
        )
        refreshState(chess, null, { from, to }, capturedByWhite, capturedByBlack)
      }
    },
    [chess, gameState, refreshState]
  )

  const newGame = useCallback(
    (newMode: GameMode, newDifficulty?: Difficulty, newHumanColor?: Color) => {
      chess.reset()
      setMode(newMode)
      if (newDifficulty) setDifficulty(newDifficulty)
      if (newHumanColor) setHumanColor(newHumanColor)
      setGameState(buildState(chess, null, null, [], []))
    },
    [chess]
  )

  const undoMove = useCallback(() => {
    chess.undo()
    if (mode === 'vs-bot') chess.undo() // undo bot move too
    setGameState(buildState(chess, null, null, [], []))
  }, [chess, mode])

  return {
    gameState,
    mode,
    difficulty,
    humanColor,
    selectSquare,
    applyBotMove,
    newGame,
    undoMove,
  }
}

function buildState(
  chess: Chess,
  selected: Square | null,
  lastMove: { from: Square; to: Square } | null,
  capturedByWhite: PieceSymbol[],
  capturedByBlack: PieceSymbol[]
): GameState {
  const legalMoves: Square[] = selected
    ? chess.moves({ square: selected, verbose: true }).map((m) => m.to as Square)
    : []

  return {
    fen: chess.fen(),
    turn: chess.turn(),
    selectedSquare: selected,
    legalMoves,
    isCheck: chess.isCheck(),
    isCheckmate: chess.isCheckmate(),
    isDraw: chess.isDraw(),
    isGameOver: chess.isGameOver(),
    capturedByWhite,
    capturedByBlack,
    moveHistory: chess.history(),
    lastMove,
  }
}

function updateCaptured(
  capturedByWhite: PieceSymbol[],
  capturedByBlack: PieceSymbol[],
  move: { captured?: PieceSymbol; color: Color }
): [PieceSymbol[], PieceSymbol[]] {
  if (!move.captured) return [capturedByWhite, capturedByBlack]
  if (move.color === 'w') {
    return [[...capturedByWhite, move.captured], capturedByBlack]
  } else {
    return [capturedByWhite, [...capturedByBlack, move.captured]]
  }
}
