import { useEffect, useMemo, useRef, useState } from 'react'
import type { ProblemSource } from '../types'
import { grade, normalize, prepare, type Grade } from '../lib/problem'

interface Props {
  problem: ProblemSource
  position: string
  onAnswered: (correct: boolean) => void
  onNext: () => void
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.95
  speechSynthesis.speak(u)
}

export function Practice({ problem, position, onAnswered, onNext }: Props) {
  const { tokens, cards } = useMemo(() => prepare(problem), [problem])
  const [placed, setPlaced] = useState<number[]>([])
  const [typed, setTyped] = useState<Record<number, string>>({})
  const [hint, setHint] = useState(false)
  const [result, setResult] = useState<Grade | null>(null)
  const inputs = useRef(new Map<number, HTMLInputElement>())
  const justPlaced = useRef<number | null>(null)

  const answerText = tokens.map((t) => t.display).join(' ')
  const canCheck = placed.length > 0 && placed.every((id) => !cards[id].typed || typed[id]?.trim())

  // 入力式カードを置いたらその入力欄にフォーカス
  useEffect(() => {
    if (justPlaced.current !== null) {
      inputs.current.get(justPlaced.current)?.focus()
      justPlaced.current = null
    }
  }, [placed])

  const place = (id: number) => {
    if (result) return
    if (cards[id].typed) justPlaced.current = id
    setPlaced((p) => [...p, id])
  }
  const remove = (id: number) => {
    if (result) return
    setPlaced((p) => p.filter((x) => x !== id))
  }

  const check = () => {
    if (!canCheck || result) return
    const words = placed.map((id) => (cards[id].typed ? typed[id] : cards[id].label))
    const g = grade(tokens, words, problem.alt)
    setResult(g)
    onAnswered(g.correct)
    speak(answerText)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && result && !(e.target instanceof HTMLInputElement)) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, onNext])

  /** 入力式カードに対応する正解（置いた位置ではなく、ヒントの日本語から引く） */
  const expectedFor = (id: number) => tokens.find((t) => t.gloss === cards[id].label)

  const onInputEnter = (id: number) => {
    const typedIds = placed.filter((x) => cards[x].typed)
    const next = typedIds[typedIds.indexOf(id) + 1]
    if (next !== undefined) inputs.current.get(next)?.focus()
    else if (canCheck) check()
  }

  const bank = cards.filter((c) => !placed.includes(c.id))
  const wrongTyped = result
    ? placed
        .filter((id) => cards[id].typed)
        .map((id) => ({ got: typed[id], exp: expectedFor(id) }))
        .filter(({ got, exp }) => exp && !exp.accepts.includes(normalize(got)))
    : []

  return (
    <div className="practice">
      <div className="q-meta">
        <span className="tag">{problem.tag}</span>
        <span className="muted small">{position}</span>
      </div>
      <p className="ja-prompt">{problem.ja}</p>

      <div className={`answer-area${result ? (result.correct ? ' ok' : ' ng') : ''}`}>
        {placed.length === 0 && <span className="placeholder">下のカードをタップして英文を組み立てる</span>}
        {placed.map((id, i) => {
          const c = cards[id]
          const state = result ? (result.positions[i] ? ' good' : ' bad') : ''
          if (!c.typed) {
            return (
              <button key={id} className={`chip placed${state}`} onClick={() => remove(id)}>
                {c.label}
              </button>
            )
          }
          const exp = expectedFor(id)
          const value = typed[id] ?? ''
          return (
            <span key={id} className={`chip typed placed${state}`}>
              <input
                ref={(el) => {
                  if (el) inputs.current.set(id, el)
                  else inputs.current.delete(id)
                }}
                value={value}
                readOnly={!!result}
                placeholder={hint && exp ? `${exp.accepts[0][0]}${'·'.repeat(exp.accepts[0].length - 1)}` : c.label}
                size={Math.max(6, value.length + 1, (hint && exp ? exp.accepts[0].length : c.label.length * 2) + 1)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => setTyped((t) => ({ ...t, [id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onInputEnter(id)
                  }
                }}
                aria-label={c.label}
              />
              {!result && (
                <button className="chip-x" onClick={() => remove(id)} aria-label="戻す">
                  ×
                </button>
              )}
            </span>
          )
        })}
      </div>

      {!result && (
        <>
          <div className="bank">
            {bank.map((c) => (
              <button key={c.id} className={`chip${c.typed ? ' typed-card' : ''}`} onClick={() => place(c.id)}>
                {c.typed && <span className="pen">✎</span>}
                {c.label}
              </button>
            ))}
          </div>
          <p className="muted small legend">✎ のカードは英単語を入力します</p>
          <div className="actions">
            <button className="sub-btn" onClick={() => setHint(true)} disabled={hint}>
              ヒント
            </button>
            <button
              className="sub-btn"
              onClick={() => {
                setPlaced([])
                setTyped({})
              }}
            >
              やり直す
            </button>
            <button className="primary-btn" onClick={check} disabled={!canCheck}>
              答え合わせ
            </button>
          </div>
          {hint && <p className="muted small">入力欄に最初の文字と文字数を表示しました。</p>}
        </>
      )}

      {result && (
        <div className="result">
          <p className={`verdict ${result.correct ? 'ok' : 'ng'}`}>{result.correct ? '○ 正解' : '× 不正解'}</p>
          <div className="model">
            <span className="muted small">模範解答</span>
            <p>
              {tokens.map((t, i) => (
                <span key={i}>
                  {i > 0 && ' '}
                  {t.gloss ? <strong>{t.display}</strong> : t.display}
                </span>
              ))}
              <button className="speak" onClick={() => speak(answerText)} aria-label="読み上げ">
                🔊
              </button>
            </p>
            {problem.alt && !result.correct && <p className="alt-note muted">ほかの語順でも正解になる場合があります。</p>}
          </div>
          {wrongTyped.length > 0 && (
            <ul className="spelling">
              {wrongTyped.map(({ got, exp }, i) => (
                <li key={i}>
                  <span className="got">{got}</span> → <strong>{exp!.accepts[0]}</strong>
                  <span className="muted small">（{exp!.gloss}）</span>
                </li>
              ))}
            </ul>
          )}
          <p className="note">{problem.note}</p>
          <button className="primary-btn next" onClick={onNext}>
            次へ
          </button>
        </div>
      )}
    </div>
  )
}
