import { useMemo } from 'react'
import * as THREE from 'three'
import type { Square } from 'chess.js'

const LIGHT_SQUARE = new THREE.Color('#c8a97e')
const DARK_SQUARE = new THREE.Color('#6b3a1f')
const HIGHLIGHT_COLOR = new THREE.Color('#d4a017')
const LEGAL_MOVE_COLOR = new THREE.Color('#c8a017')
const LAST_MOVE_COLOR = new THREE.Color('#8b6914')
const CHECK_COLOR = new THREE.Color('#8b1a1a')

export const SQUARE_SIZE = 1.0
export const BOARD_OFFSET = -3.5 // centers the board

interface Board3DProps {
  selectedSquare: Square | null
  legalMoves: Square[]
  lastMove: { from: Square; to: Square } | null
  checkSquare: Square | null
  orientation: 'white' | 'black'
  onSquareClick: (square: Square) => void
}

export function squareToPosition(square: Square, orientation: 'white' | 'black'): [number, number, number] {
  const file = square.charCodeAt(0) - 97 // a=0 .. h=7
  const rank = parseInt(square[1]) - 1    // 1=0 .. 8=7

  const x = orientation === 'white' ? file : 7 - file
  const z = orientation === 'white' ? 7 - rank : rank

  return [
    BOARD_OFFSET + x * SQUARE_SIZE + SQUARE_SIZE / 2,
    0,
    BOARD_OFFSET + z * SQUARE_SIZE + SQUARE_SIZE / 2,
  ]
}

export function positionToSquare(x: number, z: number, orientation: 'white' | 'black'): Square | null {
  const col = Math.floor((x - BOARD_OFFSET) / SQUARE_SIZE)
  const row = Math.floor((z - BOARD_OFFSET) / SQUARE_SIZE)
  if (col < 0 || col > 7 || row < 0 || row > 7) return null

  const file = orientation === 'white' ? col : 7 - col
  const rank = orientation === 'white' ? 7 - row : row

  return (String.fromCharCode(97 + file) + (rank + 1)) as Square
}

const ALL_SQUARES: Square[] = Array.from({ length: 64 }, (_, i) => {
  const file = String.fromCharCode(97 + (i % 8))
  const rank = Math.floor(i / 8) + 1
  return `${file}${rank}` as Square
})

export default function Board3D({
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  orientation,
  onSquareClick,
}: Board3DProps) {
  const frameGeo = useMemo(() => new THREE.BoxGeometry(9.2, 0.15, 9.2), [])

  return (
    <group>
      {/* Board frame */}
      <mesh geometry={frameGeo} position={[0, -0.09, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#2a1005" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Squares */}
      {ALL_SQUARES.map((sq) => {
        const fileIdx = sq.charCodeAt(0) - 97
        const rankIdx = parseInt(sq[1]) - 1
        const isLight = (fileIdx + rankIdx) % 2 === 1

        const isSelected = sq === selectedSquare
        const isLegal = legalMoves.includes(sq)
        const isLastMoveSquare = lastMove?.from === sq || lastMove?.to === sq
        const isCheck = sq === checkSquare

        let color = isLight ? LIGHT_SQUARE : DARK_SQUARE
        if (isCheck) color = CHECK_COLOR
        else if (isSelected) color = HIGHLIGHT_COLOR
        else if (isLastMoveSquare) color = LAST_MOVE_COLOR

        const pos = squareToPosition(sq, orientation)

        return (
          <group key={sq}>
            <mesh
              position={[pos[0], 0, pos[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
              onClick={(e) => {
                e.stopPropagation()
                onSquareClick(sq)
              }}
            >
              <planeGeometry args={[SQUARE_SIZE, SQUARE_SIZE]} />
              <meshStandardMaterial color={color} roughness={0.8} metalness={0.02} />
            </mesh>

            {/* Legal move indicator — subtle gold ring */}
            {isLegal && (
              <mesh position={[pos[0], 0.005, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.18, 0.28, 24]} />
                <meshStandardMaterial color={LEGAL_MOVE_COLOR} transparent opacity={0.75} roughness={0.4} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Coordinate labels */}
      <CoordinateLabels orientation={orientation} />
    </group>
  )
}

function CoordinateLabels({ orientation }: { orientation: 'white' | 'black' }) {
  const files = orientation === 'white' ? ['a','b','c','d','e','f','g','h'] : ['h','g','f','e','d','c','b','a']
  const ranks = orientation === 'white' ? ['1','2','3','4','5','6','7','8'] : ['8','7','6','5','4','3','2','1']

  return (
    <group>
      {files.map((f, i) => (
        <CoordLabel
          key={`file-${f}`}
          text={f}
          position={[BOARD_OFFSET + i * SQUARE_SIZE + SQUARE_SIZE / 2, 0.01, BOARD_OFFSET - 0.42]}
          rotateY={0}
        />
      ))}
      {ranks.map((r, i) => (
        <CoordLabel
          key={`rank-${r}`}
          text={r}
          position={[BOARD_OFFSET - 0.42, 0.01, BOARD_OFFSET + i * SQUARE_SIZE + SQUARE_SIZE / 2]}
          rotateY={0}
        />
      ))}
    </group>
  )
}

function CoordLabel({ position, rotateY }: { text?: string; position: [number, number, number]; rotateY: number }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotateY]}>
      {/* Labels rendered as flat planes — coordinate text is overlaid via CSS sidebar */}
    </mesh>
  )
}
