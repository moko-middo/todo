import { useEffect, useState } from 'react'
import type { Passage, VocabEntry } from '../types'
import { GLOSSARY } from '../data/glossary'
import { lemmaCandidates, level, passageWords, sentenceAround, tokenize } from '../lib/text'

interface Props {
  passage: Passage
  vocab: VocabEntry[]
  onBack: () => void
  onFinish: (seconds: number) => void
  onAddVocab: (entry: VocabEntry) => void
}

interface Lookup {
  word: string
  headword: string
  meaning?: string
  paragraph: string
}

function lookup(raw: string): { headword: string; meaning?: string } {
  const candidates = lemmaCandidates(raw)
  const hit = candidates.find((c) => GLOSSARY[c])
  return hit ? { headword: hit, meaning: GLOSSARY[hit] } : { headword: candidates[0] }
}

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export function Reader({ passage, vocab, onBack, onFinish, onAddVocab }: Props) {
  const words = passageWords(passage)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ seconds: number } | null>(null)
  const [selected, setSelected] = useState<Lookup | null>(null)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (startedAt === null || result) return
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [startedAt, result])

  const known = new Set(vocab.map((v) => v.word))

  const select = (word: string, paragraph: string) => {
    const { headword, meaning } = lookup(word)
    setSelected({ word, headword, meaning, paragraph })
    setMemo('')
  }

  const finish = () => {
    if (startedAt === null) return
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    // ネイティブの黙読でも 400 WPM 前後。明らかに速すぎる場合は流し読みでないか確認する
    const wpm = (words / seconds) * 60
    if (wpm > 600 && !confirm(`${Math.round(wpm)} WPM です。最後まで読みましたか？`)) return
    setResult({ seconds })
    onFinish(seconds)
  }

  const addSelected = () => {
    if (!selected) return
    onAddVocab({
      word: selected.headword,
      meaning: selected.meaning ?? memo.trim(),
      context: sentenceAround(selected.paragraph, selected.word),
      addedAt: new Date().toISOString(),
    })
    setSelected(null)
  }

  return (
    <article className="reader">
      <div className="reader-bar">
        <button className="link-btn" onClick={onBack}>
          ← 一覧へ
        </button>
        <span className="muted">
          Lv{level(passage)} · {words.toLocaleString()} 語
        </span>
        {startedAt === null ? (
          <button className="primary-btn" onClick={() => setStartedAt(Date.now())}>
            ▶ 読み始める
          </button>
        ) : result ? (
          <span className="timer done">✓ 完了</span>
        ) : (
          <span className="timer">
            {formatTime(elapsed)}
            <button className="primary-btn" onClick={finish}>
              読み終えた
            </button>
          </span>
        )}
      </div>

      <h2>{passage.title}</h2>
      <p className="muted small">
        出典:{' '}
        {passage.sourceUrl ? (
          <a href={passage.sourceUrl} target="_blank" rel="noreferrer">
            {passage.source}
          </a>
        ) : (
          passage.source
        )}
      </p>

      {result && (
        <div className="result">
          <strong>{Math.round((words / result.seconds) * 60)} WPM</strong>
          <span>
            {words.toLocaleString()} 語 / {formatTime(result.seconds)} — 累計語数に加算しました
          </span>
        </div>
      )}

      <div className={`text ${startedAt === null ? 'blurred' : ''}`}>
        {passage.paragraphs.map((para, i) => (
          <p key={i}>
            {tokenize(para).map((t, j) =>
              t.isWord ? (
                <span
                  key={j}
                  className={`w${known.has(lookup(t.text).headword) ? ' known' : ''}`}
                  onClick={() => select(t.text, para)}
                >
                  {t.text}
                </span>
              ) : (
                t.text
              ),
            )}
          </p>
        ))}
        {startedAt === null && <div className="blur-hint">「読み始める」を押すと計測が始まります</div>}
      </div>

      {selected && (
        <div className="lookup" role="dialog">
          <div className="lookup-head">
            <strong>{selected.headword}</strong>
            <button className="icon-btn" aria-label="閉じる" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
          {selected.meaning ? (
            <p>{selected.meaning}</p>
          ) : (
            <input
              className="memo"
              placeholder="辞書に未登録。意味をメモして登録できます"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          )}
          <div className="lookup-actions">
            <a
              href={`https://ejje.weblio.jp/content/${encodeURIComponent(selected.headword)}`}
              target="_blank"
              rel="noreferrer"
            >
              Weblioで調べる
            </a>
            {known.has(selected.headword) ? (
              <span className="muted small">単語帳に登録済み</span>
            ) : (
              <button className="primary-btn" onClick={addSelected}>
                単語帳に追加
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
