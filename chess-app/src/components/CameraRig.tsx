import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Orientation } from '../hooks/useCameraFlip'

const WHITE_CAMERA = new THREE.Vector3(0, 8.5, 9.5)
const BLACK_CAMERA = new THREE.Vector3(0, 8.5, -9.5)
const TARGET = new THREE.Vector3(0, 0, 0)

interface CameraRigProps {
  orientation: Orientation
  isFlipping: boolean
}

export default function CameraRig({ orientation, isFlipping: _ }: CameraRigProps) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3().copy(WHITE_CAMERA))
  const currentPos = useRef(new THREE.Vector3().copy(WHITE_CAMERA))
  const initialized = useRef(false)

  useEffect(() => {
    const dest = orientation === 'white' ? WHITE_CAMERA : BLACK_CAMERA
    targetPos.current.copy(dest)
    if (!initialized.current) {
      currentPos.current.copy(dest)
      camera.position.copy(dest)
      camera.lookAt(TARGET)
      initialized.current = true
    }
  }, [orientation, camera])

  useFrame((_, delta) => {
    const speed = Math.min(delta * 3.5, 1)
    currentPos.current.lerp(targetPos.current, speed)
    camera.position.copy(currentPos.current)
    camera.lookAt(TARGET)
  })

  return null
}
