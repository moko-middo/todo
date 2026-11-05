/** src/data/problems.ts に書く問題 */
export interface ProblemSource {
  id: string
  tag: string
  ja: string
  en: string
  alt?: string[]
  distractors?: string[]
  note: string
}

/** 答えの 1 語（または `_` でつないだかたまり） */
export interface Token {
  /** 表示用（句読点付き） */
  display: string
  /** 採点で受け付ける綴り（小文字） */
  accepts: string[]
  /** 入力式なら日本語のヒント */
  gloss?: string
}

/** 並べ替えの選択肢カード */
export interface Card {
  id: number
  /** 並べ替えカードなら英語、入力式なら日本語のヒント */
  label: string
  typed: boolean
}

export interface AnswerLog {
  problemId: string
  correct: boolean
  at: string
}
