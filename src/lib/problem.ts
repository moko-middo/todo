import type { Card, ProblemSource, Token } from '../types'

const TOKEN_RE = /^(?:\{([^|}]+)\|([^}]+)\}|([^\s{]+?))([.,;:?!]*)$/

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,;:?!"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export function parseTokens(en: string): Token[] {
  return en.split(' ').map((raw) => {
    const m = raw.match(TOKEN_RE)
    if (!m) throw new Error(`問題文の書式が正しくありません: ${raw}`)
    const [, typedWords, gloss, word, punct] = m
    if (typedWords) {
      const accepts = typedWords.split('/').map(normalize)
      return { display: typedWords.split('/')[0] + punct, accepts, gloss }
    }
    const text = word.replace(/_/g, ' ')
    return { display: text + punct, accepts: [normalize(text)] }
  })
}

/** 文頭の大文字は答えのヒントになるので、カードでは小文字にする（I は除く） */
function cardLabel(display: string, first: boolean) {
  const text = display.replace(/[.,;:?!]+$/, '')
  return first && !/^I\b/.test(text) ? text[0].toLowerCase() + text.slice(1) : text
}

export function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function makeCards(tokens: Token[], distractors: string[] = []): Card[] {
  const cards: Omit<Card, 'id'>[] = [
    ...tokens.map((t, i) =>
      t.gloss ? { label: t.gloss, typed: true } : { label: cardLabel(t.display, i === 0), typed: false },
    ),
    ...distractors.map((d) => ({ label: d, typed: false })),
  ]
  // 正解の順に並んでしまったら混ぜ直す
  let order = shuffle(cards.map((_, i) => i))
  while (cards.length > 2 && order.every((v, i) => v === i)) order = shuffle(order)
  return order.map((i, id) => ({ ...cards[i], id }))
}

export interface Grade {
  correct: boolean
  /** 並べた各位置が模範解答と一致しているか */
  positions: boolean[]
}

/** answer: 並べた順の語（入力式は入力した文字） */
export function grade(tokens: Token[], answer: string[], alt: string[] = []): Grade {
  const got = answer.map(normalize)
  const positions = got.map((w, i) => tokens[i]?.accepts.includes(w) ?? false)
  const matchesMain = got.length === tokens.length && positions.every(Boolean)
  const sentence = got.join(' ')
  const matchesAlt = alt.some((a) => normalize(a) === sentence)
  return matchesAlt ? { correct: true, positions: got.map(() => true) } : { correct: matchesMain, positions }
}

export function prepare(p: ProblemSource) {
  const tokens = parseTokens(p.en)
  return { tokens, cards: makeCards(tokens, p.distractors) }
}
