import type { Passage } from '../types'

const WORD_RE = /[A-Za-z][A-Za-z'’-]*/g

export function countWords(text: string): number {
  return text.match(WORD_RE)?.length ?? 0
}

export function passageWords(p: Passage): number {
  return p.paragraphs.reduce((sum, para) => sum + countWords(para), 0)
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 3) return 1
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '')
  return Math.max(1, trimmed.match(/[aeiouy]{1,2}/g)?.length ?? 1)
}

/** Flesch Reading Ease（高いほど易しい） */
export function readingEase(p: Passage): number {
  const text = p.paragraphs.join(' ')
  const words = text.match(WORD_RE) ?? []
  if (words.length === 0) return 100
  const sentences = Math.max(1, text.split(/[.!?;:]+(?:\s|$)/).filter((s) => s.trim()).length)
  const syl = words.reduce((sum, w) => sum + syllables(w), 0)
  return 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length)
}

/** 1（易）〜5（難）の5段階レベル */
export function level(p: Passage): number {
  const ease = readingEase(p)
  if (ease >= 60) return 1
  if (ease >= 45) return 2
  if (ease >= 30) return 3
  if (ease >= 15) return 4
  return 5
}

/** 辞書引き用に語形を正規化した候補を返す（完全一致を優先） */
export function lemmaCandidates(raw: string): string[] {
  const w = raw.toLowerCase().replace(/[’']s$/, '').replace(/[^a-z-]/g, '')
  const out = [w]
  if (w.endsWith('ies')) out.push(w.slice(0, -3) + 'y')
  if (w.endsWith('es')) out.push(w.slice(0, -2))
  if (w.endsWith('s')) out.push(w.slice(0, -1))
  if (w.endsWith('ied')) out.push(w.slice(0, -3) + 'y')
  if (w.endsWith('ed')) out.push(w.slice(0, -2), w.slice(0, -1))
  if (w.endsWith('ing')) out.push(w.slice(0, -3), w.slice(0, -3) + 'e')
  if (w.endsWith('ly')) out.push(w.slice(0, -2))
  return out
}

/** 段落テキストを単語とそれ以外に分割する（単語はタップ可能にするため） */
export function tokenize(text: string): { text: string; isWord: boolean }[] {
  const tokens: { text: string; isWord: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(WORD_RE)) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index), isWord: false })
    tokens.push({ text: m[0], isWord: true })
    last = m.index + m[0].length
  }
  if (last < text.length) tokens.push({ text: text.slice(last), isWord: false })
  return tokens
}

/** 貼り付けたテキストを段落に分ける。PDF由来の行中改行はつなげる */
export function splitParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/-\n(?=[a-z])/g, '').replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

/** 指定語を含む文を抜き出す（単語帳の例文用） */
export function sentenceAround(paragraph: string, word: string): string {
  const sentences = paragraph.match(/[^.!?]+[.!?]*/g) ?? [paragraph]
  const hit = sentences.find((s) => new RegExp(`\\b${word.replace(/[^A-Za-z'-]/g, '')}\\b`, 'i').test(s))
  return (hit ?? sentences[0]).trim()
}
