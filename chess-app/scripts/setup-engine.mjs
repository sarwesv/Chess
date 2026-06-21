import { copyFile, mkdir, access } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'node_modules/stockfish/bin')
const dest = resolve(root, 'public')

async function exists(path) {
  try { await access(path); return true } catch { return false }
}

async function setup() {
  await mkdir(dest, { recursive: true })

  const files = [
    ['stockfish-18-lite-single.js', 'stockfish.js'],
    ['stockfish-18-lite-single.wasm', 'stockfish.wasm'],
  ]

  for (const [from, to] of files) {
    const destPath = resolve(dest, to)
    if (await exists(destPath)) continue
    await copyFile(resolve(src, from), destPath)
    console.log(`Copied ${from} → public/${to}`)
  }
}

setup().catch((e) => { console.error(e); process.exit(1) })
