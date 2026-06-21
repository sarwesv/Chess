import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PieceSymbol, Color } from 'chess.js'
import type { Orientation } from '../hooks/useCameraFlip'
import {
  PAWN_PROFILE,
  ROOK_PROFILE,
  BISHOP_PROFILE,
  KNIGHT_PROFILE,
  QUEEN_PROFILE,
  KING_PROFILE,
  buildLatheGeometry,
} from '../geometry/pieceProfiles'
import { useMemo } from 'react'

interface Piece3DProps {
  type: PieceSymbol
  color: Color
  position: [number, number, number]
  orientation: Orientation
  isSelected: boolean
  isLastMove: boolean
  onClick: () => void
}

const SCALE = 0.62
const MOVE_SPEED = 9   // lerp factor — higher = snappier
const ARC_SCALE = 0.45 // how high pieces arc relative to horizontal distance remaining

const lightWoodColor = new THREE.Color('#c8a97e')
const darkWoodColor  = new THREE.Color('#3d1f0a')

export default function Piece3D({ type, color, position, orientation, isSelected, isLastMove, onClick }: Piece3DProps) {
  const groupRef       = useRef<THREE.Group>(null)
  const currentPos     = useRef(new THREE.Vector3(position[0], position[1], position[2]))
  const targetPos      = useRef(new THREE.Vector3(position[0], position[1], position[2]))
  const prevOrient     = useRef<Orientation>(orientation)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Update target to latest prop values
    targetPos.current.set(position[0], position[1], position[2])

    // When orientation flips, snap instead of animate so pieces don't
    // visually fly across the board during the camera rotation.
    if (orientation !== prevOrient.current) {
      prevOrient.current = orientation
      currentPos.current.copy(targetPos.current)
    }

    const speed = Math.min(delta * MOVE_SPEED, 1)

    // Lerp X and Z (horizontal slide)
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * speed
    currentPos.current.z += (targetPos.current.z - currentPos.current.z) * speed
    // Lerp base Y (board height)
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * speed

    // Arc: lift proportional to remaining horizontal distance
    const dx    = targetPos.current.x - currentPos.current.x
    const dz    = targetPos.current.z - currentPos.current.z
    const hDist = Math.sqrt(dx * dx + dz * dz)
    const arcY  = hDist * ARC_SCALE

    // Hover lift when selected
    const hoverY = isSelected ? 0.18 : 0

    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y + arcY + hoverY,
      currentPos.current.z,
    )
  })

  const pieceColor = color === 'w' ? lightWoodColor : darkWoodColor
  const roughness  = color === 'w' ? 0.6 : 0.5

  return (
    <group
      ref={groupRef}
      scale={SCALE}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      <PieceGeometry
        type={type}
        pieceColor={pieceColor}
        roughness={roughness}
        isSelected={isSelected}
        isLastMove={isLastMove}
      />
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
  const emissive = isSelected
    ? new THREE.Color('#d4a017').multiplyScalar(0.3)
    : isLastMove
    ? new THREE.Color('#8b6914').multiplyScalar(0.15)
    : new THREE.Color(0, 0, 0)

  const mat = (
    <meshStandardMaterial color={pieceColor} roughness={roughness} metalness={0.05} emissive={emissive} />
  )

  switch (type) {
    case 'p': return <LatheP profile={PAWN_PROFILE}>{mat}</LatheP>
    case 'r': return <LatheP profile={ROOK_PROFILE}>{mat}</LatheP>
    case 'b': return <LatheP profile={BISHOP_PROFILE}>{mat}</LatheP>
    case 'q': return <LatheP profile={QUEEN_PROFILE}>{mat}</LatheP>
    case 'k': return <KingMesh>{mat}</KingMesh>
    case 'n': return <KnightMesh pieceColor={pieceColor} roughness={roughness} emissive={emissive} />
    default:  return null
  }
}

function LatheP({ profile, children }: { profile: [number, number][]; children: React.ReactNode }) {
  const geo = useMemo(() => buildLatheGeometry(profile), [profile])
  return <mesh geometry={geo} castShadow receiveShadow>{children}</mesh>
}

function KingMesh({ children }: { children: React.ReactNode }) {
  const bodyGeo = useMemo(() => buildLatheGeometry(KING_PROFILE), [])
  return (
    <group>
      <mesh geometry={bodyGeo} castShadow receiveShadow>{children}</mesh>
      <mesh position={[0, 1.30, 0]} castShadow>
        <boxGeometry args={[0.28, 0.07, 0.07]} />{children}
      </mesh>
      <mesh position={[0, 1.36, 0]} castShadow>
        <boxGeometry args={[0.07, 0.18, 0.07]} />{children}
      </mesh>
    </group>
  )
}

function KnightMesh({ pieceColor, roughness, emissive }: { pieceColor: THREE.Color; roughness: number; emissive: THREE.Color }) {
  const bodyGeo = useMemo(() => buildLatheGeometry(KNIGHT_PROFILE), [])
  const mat = <meshStandardMaterial color={pieceColor} roughness={roughness} metalness={0.05} emissive={emissive} />
  return (
    <group>
      <mesh geometry={bodyGeo} castShadow receiveShadow>{mat}</mesh>
      <mesh position={[0.04, 0.58, 0]} rotation={[0.3, 0, -0.15]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.32, 12]} />{mat}
      </mesh>
      <mesh position={[0.06, 0.82, 0]} rotation={[0.5, 0, -0.1]} castShadow>
        <boxGeometry args={[0.22, 0.20, 0.16]} />{mat}
      </mesh>
      <mesh position={[0.18, 0.76, 0]} rotation={[0.2, 0, 0.1]} castShadow>
        <boxGeometry args={[0.14, 0.10, 0.12]} />{mat}
      </mesh>
    </group>
  )
}
