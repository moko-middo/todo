/** public/podcasts/index.json の 1 件（scripts/collect-podcasts.mjs が生成） */
export interface Episode {
  id: string
  title: string
  audio: string
  transcript: string
  duration: number
  words: number
  translated: boolean
  createdAt?: string
}

/** [開始秒, 終了秒, 単語（前の空白を含む）] */
export type Word = [number, number, string]

export interface Sentence {
  start: number
  end: number
  text: string
  ja?: string
  words: Word[]
}

/** content/podcasts/*.json（scripts/transcribe.py が生成） */
export interface Transcript {
  title: string
  audio: string
  duration: number
  sentences: Sentence[]
}

export interface ListenRecord {
  id: string
  episodeId: string
  title: string
  words: number
  seconds: number
  finishedAt: string
}
