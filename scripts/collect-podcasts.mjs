// content/podcasts/ の音声と文字起こし（.json）を public/podcasts/ にコピーし、
// 一覧用の public/podcasts/index.json を作る（npm run dev / build の前に自動実行）。
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'content/podcasts')
const OUT = path.join(ROOT, 'public/podcasts')

const countWords = (s) => s.match(/[A-Za-z][A-Za-z'’-]*/g)?.length ?? 0

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

const episodes = []
const files = existsSync(SRC) ? await readdir(SRC) : []
for (const f of files.filter((f) => f.endsWith('.json')).sort()) {
  const t = JSON.parse(await readFile(path.join(SRC, f), 'utf8'))
  if (!existsSync(path.join(SRC, t.audio))) {
    console.warn(`[podcasts] ${f}: 音声 ${t.audio} が見つからないためスキップ`)
    continue
  }
  await copyFile(path.join(SRC, f), path.join(OUT, f))
  await copyFile(path.join(SRC, t.audio), path.join(OUT, t.audio))
  episodes.push({
    id: path.basename(f, '.json'),
    title: t.title,
    audio: t.audio,
    transcript: f,
    duration: t.duration,
    words: t.sentences.reduce((sum, s) => sum + countWords(s.text), 0),
    translated: t.sentences.length > 0 && t.sentences.every((s) => s.ja),
    createdAt: t.createdAt,
  })
}

const waiting = files.filter((f) => /\.(mp3|m4a|aac|ogg|opus|webm|wav|flac)$/i.test(f) && !files.includes(f.replace(/\.[^.]+$/, '.json')))
if (waiting.length) console.log(`[podcasts] 文字起こし待ち: ${waiting.join(', ')}`)

episodes.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
await writeFile(path.join(OUT, 'index.json'), JSON.stringify(episodes))
console.log(`[podcasts] ${episodes.length} episode(s) -> public/podcasts/`)
