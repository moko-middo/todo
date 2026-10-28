// content/papers/*.pdf と content/standards/*.pdf から本文を取り出し、
// src/data/pdf-passages.json に書き出す（npm run dev / build の前に自動実行）。
//
// 同名の .json を置くとタイトル等を上書きできる:
//   content/papers/foo.pdf + content/papers/foo.json
//   { "title": "...", "source": "...", "url": "https://..." }
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'src/data/pdf-passages.json')
const DIRS = [
  { dir: 'content/papers', category: 'paper' },
  { dir: 'content/standards', category: 'standard' },
]
/** 1回分の目安語数。これより長い文書は段落の切れ目で分割する */
const PART_WORDS = 1000

const countWords = (s) => s.match(/[A-Za-z][A-Za-z'’-]*/g)?.length ?? 0
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : 0
}

/** ページのテキスト要素を行にまとめる */
function toLines(items, pageNo) {
  const lines = []
  let cur = null
  for (const it of items) {
    const [a, b, , d, x, y] = it.transform
    if (Math.abs(b) > 0.01 || a <= 0) continue // 回転した文字（arXiv の縦書きスタンプなど）
    const size = Math.abs(d) || it.height
    if (!cur || Math.abs(y - cur.y) > size * 0.5) {
      if (cur && cur.text.trim()) lines.push(cur)
      cur = { text: '', x, y, size, right: x, page: pageNo }
    }
    if (it.str) {
      const gap = x - cur.right
      if (cur.text && gap > size * 0.15 && !cur.text.endsWith(' ') && !it.str.startsWith(' ')) cur.text += ' '
      cur.text += it.str
      cur.right = x + it.width
      cur.size = Math.max(cur.size, size)
    }
  }
  if (cur && cur.text.trim()) lines.push(cur)
  for (const l of lines) l.text = l.text.replace(/\s+/g, ' ').trim()
  return lines
}

/** 表・数式・図中の文字などを判定（英単語が少ない行） */
function isProse(text) {
  const nonSpace = text.replace(/\s/g, '').length
  const letters = (text.match(/[A-Za-z]/g) ?? []).length
  return nonSpace > 0 && letters / nonSpace > 0.6
}

const STOP_HEADING = /^(?:[\dIVX]+\.?\s*)?(references|bibliography|acknowledg(e)?ments?)$/i

function linesToParagraphs(pages) {
  // 3ページ以上に同じ文言で現れる行は、ヘッダー/フッターとみなして除く
  const freq = new Map()
  for (const lines of pages) {
    for (const t of new Set(lines.map((l) => l.text.replace(/\d+/g, '#')))) freq.set(t, (freq.get(t) ?? 0) + 1)
  }
  const repeated = (l) => pages.length >= 3 && freq.get(l.text.replace(/\d+/g, '#')) >= 3

  const all = pages.flat().filter((l) => !/^\d{1,4}$/.test(l.text) && !repeated(l))
  const bodySize = median(all.map((l) => l.size))
  const body = all.filter((l) => Math.abs(l.size - bodySize) < bodySize * 0.1)
  const lineGap = median(body.slice(1).map((l, i) => body[i].y - l.y).filter((g) => g > 0)) || bodySize * 1.2
  const lineWidth = median(body.map((l) => l.right - l.x))

  const paragraphs = []
  let buf = ''
  const flush = () => {
    const p = buf.trim()
    if (p && isProse(p) && countWords(p) >= 3) paragraphs.push(p)
    buf = ''
  }

  let prev = null
  for (const l of all) {
    if (STOP_HEADING.test(l.text)) break
    const isHeading = l.size > bodySize * 1.15
    const small = l.size < bodySize * 0.85 // 脚注・キャプション等
    if (small) continue
    let breakBefore = !prev || isHeading || prev.heading
    if (prev && !breakBefore) {
      const gap = prev.y - l.y
      const samePage = prev.page === l.page
      const prevShort = prev.right - prev.x < lineWidth * 0.8 && /[.:?!]["”)]?$/.test(prev.text)
      if (samePage && gap > lineGap * 1.5) breakBefore = true
      else if (prevShort) breakBefore = true
      else if (samePage && gap > 0 && l.x - prev.x > bodySize * 0.8 && gap < lineGap * 1.5) breakBefore = true // 字下げ
    }
    if (breakBefore) flush()
    if (/[-\u2010\u00ad]$/.test(buf) && /^[a-z]/.test(l.text)) buf = buf.slice(0, -1) + l.text
    else buf += (buf ? ' ' : '') + l.text
    prev = { ...l, heading: isHeading }
  }
  flush()
  return paragraphs
}

function largestText(lines) {
  const max = Math.max(...lines.map((l) => l.size))
  return lines
    .filter((l) => l.size >= max * 0.95)
    .map((l) => l.text)
    .join(' ')
    .trim()
}

function splitParts(paragraphs) {
  const total = paragraphs.reduce((s, p) => s + countWords(p), 0)
  if (total <= PART_WORDS * 1.5) return [paragraphs]
  const n = Math.round(total / PART_WORDS)
  const target = total / n
  const parts = [[]]
  let words = 0
  for (const p of paragraphs) {
    if (words >= target * parts.length && parts.length < n) parts.push([])
    parts.at(-1).push(p)
    words += countWords(p)
  }
  return parts
}

async function extract(file, category) {
  const data = new Uint8Array(await readFile(file))
  const doc = await getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise
  const pages = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const { items } = await page.getTextContent()
    pages.push(toLines(items, i))
  }
  const meta = await doc.getMetadata().catch(() => null)
  const base = path.basename(file, '.pdf')
  const sidecarPath = file.replace(/\.pdf$/i, '.json')
  const sidecar = existsSync(sidecarPath) ? JSON.parse(await readFile(sidecarPath, 'utf8')) : {}

  const title =
    sidecar.title ||
    (pages[0]?.length && largestText(pages[0])) ||
    meta?.info?.Title ||
    base.replace(/[-_]+/g, ' ')

  const paragraphs = linesToParagraphs(pages).filter((p) => p !== title)
  const parts = splitParts(paragraphs)
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return parts.map((paras, i) => ({
    id: `pdf-${category}-${slug}${parts.length > 1 ? `-${i + 1}` : ''}`,
    title: parts.length > 1 ? `${title} (${i + 1}/${parts.length})` : title,
    category,
    source: sidecar.source || `${path.basename(file)}`,
    ...(sidecar.url ? { sourceUrl: sidecar.url } : {}),
    paragraphs: paras,
  }))
}

const passages = []
for (const { dir, category } of DIRS) {
  const abs = path.join(ROOT, dir)
  if (!existsSync(abs)) continue
  const files = (await readdir(abs)).filter((f) => f.toLowerCase().endsWith('.pdf')).sort()
  for (const f of files) {
    try {
      const out = await extract(path.join(abs, f), category)
      const words = out.reduce((s, p) => s + p.paragraphs.reduce((t, q) => t + countWords(q), 0), 0)
      console.log(`[pdf] ${dir}/${f}: ${words} words, ${out.length} part(s)`)
      passages.push(...out)
    } catch (e) {
      console.warn(`[pdf] ${dir}/${f}: 読み取りに失敗しました (${e.message})`)
    }
  }
}

await writeFile(OUT, JSON.stringify(passages, null, 1) + '\n')
console.log(`[pdf] ${passages.length} passage(s) -> ${path.relative(ROOT, OUT)}`)
