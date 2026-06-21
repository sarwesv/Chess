import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { Square, PieceSymbol, Color } from 'chess.js'
import Board3D, { squareToPosition } from './Board3D'
import Piece3D from './Piece3D'
import CameraRig from './CameraRig'
import type { GameState } from '../hooks/useChessGame'
import type { Orientation } from '../hooks/useCameraFlip'

interface ChessSceneProps {
  gameState: GameState
  orientation: Orientation
  isFlipping: boolean
  onSquareClick: (square: Square) => void
}

interface PieceData {
  type: PieceSymbol
  color: Color
  square: Square
}

export default function ChessScene({ gameState, orientation, isFlipping: _, onSquareClick }: ChessSceneProps) {
  const pieces = useMemo(() => {
    const chess = new Chess(gameState.fen)
    const result: PieceData[] = []
    for (let rank = 1; rank <= 8; rank++) {
      for (const file of ['a','b','c','d','e','f','g','h']) {
        const sq = `${file}${rank}` as Square
        const piece = chess.get(sq)
        if (piece) result.push({ type: piece.type, color: piece.color, square: sq })
      }
    }
    return result
  }, [gameState.fen])

  // Find king in check square
  const checkSquare = useMemo(() => {
    if (!gameState.isCheck) return null
    const chess = new Chess(gameState.fen)
    const turn = chess.turn()
    for (let rank = 1; rank <= 8; rank++) {
      for (const file of ['a','b','c','d','e','f','g','h']) {
        const sq = `${file}${rank}` as Square
        const p = chess.get(sq)
        if (p && p.type === 'k' && p.color === turn) return sq
      }
    }
    return null
  }, [gameState.fen, gameState.isCheck])

  return (
    <Canvas
      shadows
      camera={{ fov: 45, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: 2 /* ACESFilmicToneMapping */ }}
    >
      <CameraRig orientation={orientation} isFlipping={false} />

      {/* Lighting — warm candlelight feel */}
      <ambientLight intensity={0.35} color="#ffe8c0" />
      <directionalLight
        position={[6, 12, 8]}
        intensity={1.4}
        color="#ffd580"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={40}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-4, 6, -4]} intensity={0.5} color="#ff9940" />
      <pointLight position={[4, 3, 4]} intensity={0.3} color="#ffcc80" />

      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a0a02" roughness={0.85} metalness={0.05} />
      </mesh>

      <Suspense fallback={null}>
        <Board3D
          selectedSquare={gameState.selectedSquare}
          legalMoves={gameState.legalMoves}
          lastMove={gameState.lastMove}
          checkSquare={checkSquare}
          orientation={orientation}
          onSquareClick={onSquareClick}
        />

        {pieces.map(({ type, color, square }) => {
          const pos = squareToPosition(square, orientation)
          return (
            <Piece3D
              key={square}
              type={type}
              color={color}
              position={[pos[0], 0.04, pos[2]]}
              isSelected={gameState.selectedSquare === square}
              isLastMove={gameState.lastMove?.from === square || gameState.lastMove?.to === square}
              onClick={() => onSquareClick(square)}
            />
          )
        })}
      </Suspense>
    </Canvas>
  )
}
