export type Category = 'standard' | 'paper'

export interface Passage {
  id: string
  title: string
  category: Category
  /** 出典の説明（例: "RFC 9110 §1"、"arXiv:xxxx (CC BY 4.0)"） */
  source: string
  sourceUrl?: string
  /** 段落ごとの本文 */
  paragraphs: string[]
  /** ユーザーが取り込んだ文書なら true */
  custom?: boolean
}

export interface ReadingRecord {
  id: string
  passageId: string
  title: string
  words: number
  seconds: number
  finishedAt: string
}

export interface VocabEntry {
  word: string
  meaning: string
  context: string
  addedAt: string
}
