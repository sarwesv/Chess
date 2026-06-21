import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Orientation } from '../hooks/useCameraFlip'

const RADIUS = 9.5
const HEIGHT = 8.5
const TARGET = new THREE.Vector3(0, 0, 0)

function orientationToAngle(o: Orientation) {
  return o === 'white' ? 0 : Math.PI
}

export default function CameraRig({ orientation }: { orientation: Orientation }) {
  const { camera, size } = useThree()
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
    const cur = currentAngle.current
    let diff = dest - ((cur % (2 * Math.PI)) + (cur < 0 ? 2 * Math.PI : 0))
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI
    targetAngle.current = cur + diff
  }, [orientation])

  useFrame((_, delta) => {
    const aspect = size.width / size.height

    // On portrait/narrow screens widen the FOV so the board fits horizontally
    const perspCam = camera as THREE.PerspectiveCamera
    const targetFov = aspect < 1 ? Math.min(45 / aspect, 95) : 45
    perspCam.fov += (targetFov - perspCam.fov) * Math.min(delta * 6, 1)
    perspCam.updateProjectionMatrix()

    // Pull camera back proportionally on narrow screens so the board isn't clipped
    const scale = aspect < 1 ? Math.max(1, 0.85 / aspect) : 1
    const radius = RADIUS * scale
    const height = HEIGHT * scale

    currentAngle.current += (targetAngle.current - currentAngle.current) * Math.min(delta * 3, 1)
    const a = currentAngle.current
    camera.position.set(radius * Math.sin(a), height, radius * Math.cos(a))
    camera.lookAt(TARGET)
  })

  return null
}
