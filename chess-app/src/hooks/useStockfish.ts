import { useEffect, useRef, useCallback } from 'react'
import type { Difficulty } from './useChessGame'
import type { Square } from 'chess.js'

const SKILL_LEVELS: Record<Difficulty, number> = {
  easy: 3,
  medium: 10,
  hard: 20,
}

const SEARCH_DEPTHS: Record<Difficulty, number> = {
  easy: 5,
  medium: 12,
  hard: 99,
}

interface StockfishHook {
  requestMove: (fen: string, difficulty: Difficulty, onMove: (from: Square, to: Square) => void) => void
}

export function useStockfish(): StockfishHook {
  const workerRef = useRef<Worker | null>(null)
  const callbackRef = useRef<((from: Square, to: Square) => void) | null>(null)
  const readyRef = useRef(false)
  const pendingRef = useRef<{ fen: string; difficulty: Difficulty } | null>(null)

  useEffect(() => {
    // Load stockfish from the public directory as a classic Worker
    const worker = new Worker(`${import.meta.env.BASE_URL}stockfish.js`)
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = typeof e.data === 'string' ? e.data : ''
      if (line === 'readyok') {
        readyRef.current = true
        if (pendingRef.current && callbackRef.current) {
          sendPosition(worker, pendingRef.current.fen, pendingRef.current.difficulty)
          pendingRef.current = null
        }
        return
      }
      if (line.startsWith('bestmove')) {
        const parts = line.split(' ')
        const moveStr = parts[1]
        if (moveStr && moveStr !== '(none)' && callbackRef.current) {
          const from = moveStr.slice(0, 2) as Square
          const to = moveStr.slice(2, 4) as Square
          callbackRef.current(from, to)
          callbackRef.current = null
        }
      }
    }

    worker.postMessage('uci')
    worker.postMessage('isready')

    return () => worker.terminate()
  }, [])

  const requestMove = useCallback((fen: string, difficulty: Difficulty, onMove: (from: Square, to: Square) => void) => {
    callbackRef.current = onMove
    const worker = workerRef.current
    if (!worker) return

    if (!readyRef.current) {
      pendingRef.current = { fen, difficulty }
      return
    }

    sendPosition(worker, fen, difficulty)
  }, [])

  return { requestMove }
}

function sendPosition(worker: Worker, fen: string, difficulty: Difficulty) {
  const skill = SKILL_LEVELS[difficulty]
  const depth = SEARCH_DEPTHS[difficulty]
  worker.postMessage(`setoption name Skill Level value ${skill}`)
  worker.postMessage(`position fen ${fen}`)
  worker.postMessage(`go depth ${depth}`)
}
