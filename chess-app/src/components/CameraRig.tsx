import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Orientation } from '../hooks/useCameraFlip'

// Camera orbits on a circle around Y axis at fixed radius + height
const RADIUS = 9.5
const HEIGHT = 8.5
const TARGET = new THREE.Vector3(0, 0, 0)

// white = angle 0 (positive Z side), black = angle π (negative Z side)
function orientationToAngle(o: Orientation) {
  return o === 'white' ? 0 : Math.PI
}

export default function CameraRig({ orientation }: { orientation: Orientation }) {
  const { camera } = useThree()
  const currentAngle = useRef(0)
  const targetAngle = useRef(0)
  const initialized = useRef(false)

  useEffect(() => {
    const dest = orientationToAngle(orientation)

    if (!initialized.current) {
      currentAngle.current = dest
      targetAngle.current = dest
      initialized.current = true
      return
    }

    // Find the shortest arc from current accumulated angle to new destination
    const cur = currentAngle.current
    let diff = (dest - ((cur % (2 * Math.PI)) + (cur < 0 ? 2 * Math.PI : 0)))
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI
    targetAngle.current = cur + diff
  }, [orientation])

  useFrame((_, delta) => {
    // Smoothly rotate toward target angle
    currentAngle.current += (targetAngle.current - currentAngle.current) * Math.min(delta * 3, 1)

    const a = currentAngle.current
    camera.position.set(
      RADIUS * Math.sin(a),
      HEIGHT,
      RADIUS * Math.cos(a),
    )
    camera.lookAt(TARGET)
  })

  return null
}
