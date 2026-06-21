import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PieceSymbol, Color } from 'chess.js'
import {
  PAWN_PROFILE,
  ROOK_PROFILE,
  BISHOP_PROFILE,
  KNIGHT_PROFILE,
  QUEEN_PROFILE,
  KING_PROFILE,
  buildLatheGeometry,
} from '../geometry/pieceProfiles'

interface Piece3DProps {
  type: PieceSymbol
  color: Color
  position: [number, number, number]
  isSelected: boolean
  isLastMove: boolean
  onClick: () => void
}

const SCALE = 0.62

const lightWoodColor = new THREE.Color('#c8a97e')
const darkWoodColor = new THREE.Color('#3d1f0a')
const lightWoodRough = 0.6
const darkWoodRough = 0.5

export default function Piece3D({ type, color, position, isSelected, isLastMove, onClick }: Piece3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const targetY = useRef(position[1])
  const currentY = useRef(position[1])

  // Animate hover when selected
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const hoverTarget = isSelected ? position[1] + 0.15 : position[1]
    targetY.current = hoverTarget
    currentY.current += (targetY.current - currentY.current) * Math.min(delta * 8, 1)
    groupRef.current.position.y = currentY.current
  })

  const pieceColor = color === 'w' ? lightWoodColor : darkWoodColor
  const roughness = color === 'w' ? lightWoodRough : darkWoodRough

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      scale={SCALE}
    >
      <PieceGeometry type={type} pieceColor={pieceColor} roughness={roughness} isSelected={isSelected} isLastMove={isLastMove} />
    </group>
  )
}

interface PieceGeometryProps {
  type: PieceSymbol
  pieceColor: THREE.Color
  roughness: number
  isSelected: boolean
  isLastMove: boolean
}

function PieceGeometry({ type, pieceColor, roughness, isSelected, isLastMove }: PieceGeometryProps) {
  const emissiveColor = isSelected
    ? new THREE.Color('#d4a017').multiplyScalar(0.3)
    : isLastMove
    ? new THREE.Color('#8b6914').multiplyScalar(0.15)
    : new THREE.Color(0, 0, 0)

  const mat = (
    <meshStandardMaterial
      color={pieceColor}
      roughness={roughness}
      metalness={0.05}
      emissive={emissiveColor}
    />
  )

  switch (type) {
    case 'p': return <Lathepiece profile={PAWN_PROFILE}>{mat}</Lathepiece>
    case 'r': return <Lathepiece profile={ROOK_PROFILE}>{mat}</Lathepiece>
    case 'b': return <Lathepiece profile={BISHOP_PROFILE}>{mat}</Lathepiece>
    case 'q': return <Lathepiece profile={QUEEN_PROFILE}>{mat}</Lathepiece>
    case 'k': return <KingMesh>{mat}</KingMesh>
    case 'n': return <KnightMesh pieceColor={pieceColor} roughness={roughness} emissiveColor={emissiveColor} />
    default: return null
  }
}

function Lathepiece({ profile, children }: { profile: [number, number][]; children: React.ReactNode }) {
  const geo = useMemo(() => buildLatheGeometry(profile), [profile])
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      {children}
    </mesh>
  )
}

function KingMesh({ children }: { children: React.ReactNode }) {
  const bodyGeo = useMemo(() => buildLatheGeometry(KING_PROFILE), [])
  return (
    <group>
      <mesh geometry={bodyGeo} castShadow receiveShadow>{children}</mesh>
      {/* Cross horizontal bar */}
      <mesh position={[0, 1.30, 0]} castShadow>
        <boxGeometry args={[0.28, 0.07, 0.07]} />
        {children}
      </mesh>
      {/* Cross vertical bar */}
      <mesh position={[0, 1.36, 0]} castShadow>
        <boxGeometry args={[0.07, 0.18, 0.07]} />
        {children}
      </mesh>
    </group>
  )
}

function KnightMesh({
  pieceColor,
  roughness,
  emissiveColor,
}: {
  pieceColor: THREE.Color
  roughness: number
  emissiveColor: THREE.Color
}) {
  const bodyGeo = useMemo(() => buildLatheGeometry(KNIGHT_PROFILE), [])
  const mat = (
    <meshStandardMaterial color={pieceColor} roughness={roughness} metalness={0.05} emissive={emissiveColor} />
  )
  return (
    <group>
      {/* Base */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>{mat}</mesh>
      {/* Neck */}
      <mesh position={[0.04, 0.58, 0]} rotation={[0.3, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.32, 12]} />
        {mat}
      </mesh>
      {/* Head */}
      <mesh position={[0.06, 0.82, 0]} rotation={[0.5, 0, -0.1]} castShadow>
        <boxGeometry args={[0.22, 0.20, 0.16]} />
        {mat}
      </mesh>
      {/* Snout */}
      <mesh position={[0.18, 0.76, 0]} rotation={[0.2, 0, 0.1]} castShadow>
        <boxGeometry args={[0.14, 0.10, 0.12]} />
        {mat}
      </mesh>
    </group>
  )
}
