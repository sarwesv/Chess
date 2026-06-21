import { useRef, useState, useCallback } from 'react'
import type { Color } from 'chess.js'

export type Orientation = 'white' | 'black'

export function useCameraFlip() {
  const [orientation, setOrientation] = useState<Orientation>('white')
  const [isFlipping, setIsFlipping] = useState(false)
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flip = useCallback((toColor: Color) => {
    const target: Orientation = toColor === 'w' ? 'white' : 'black'
    setIsFlipping(true)
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current)
    flipTimeoutRef.current = setTimeout(() => {
      setOrientation(target)
      setIsFlipping(false)
    }, 800)
  }, [])

  return { orientation, isFlipping, flip }
}
