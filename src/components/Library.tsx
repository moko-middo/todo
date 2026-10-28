import { useMemo, useState } from 'react'
import type { Category, Passage, ReadingRecord } from '../types'
import { level, passageWords } from '../lib/text'

interface Props {
  passages: Passage[]
  records: ReadingRecord[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

type Filter = 'all' | Category

const CATEGORY_LABEL: Record<Category, string> = { standard: '規格', paper: '論文' }

export function Library({ passages, records, onOpen, onDelete }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [maxLevel, setMaxLevel] = useState(5)

  const readCount = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of records) counts.set(r.passageId, (counts.get(r.passageId) ?? 0) + 1)
    return counts
  }, [records])

  const items = passages
    .map((p) => ({ p, words: passageWords(p), lv: level(p) }))
    .filter(({ p, lv }) => (filter === 'all' || p.category === filter) && lv <= maxLevel)
    .sort((a, b) => a.lv - b.lv || a.words - b.words)

  return (
    <section>
      <div className="toolbar">
        <div className="segmented">
          {(['all', 'standard', 'paper'] as Filter[]).map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f === 'all' ? 'すべて' : CATEGORY_LABEL[f]}
            </button>
          ))}
        </div>
        <label className="level-filter">
          レベル〜
          <select value={maxLevel} onChange={(e) => setMaxLevel(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Lv{n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <p className="empty">条件に合う文書がありません。</p>
      ) : (
        <ul className="card-list">
          {items.map(({ p, words, lv }) => (
            <li key={p.id} className="card">
              <button className="card-main" onClick={() => onOpen(p.id)}>
                <div className="card-meta">
                  <span className={`badge ${p.category}`}>{CATEGORY_LABEL[p.category]}</span>
                  <span className={`badge lv lv${lv}`}>Lv{lv}</span>
                  <span className="muted">{words.toLocaleString()} 語</span>
                  {readCount.has(p.id) && <span className="read-mark">✓ {readCount.get(p.id)}回</span>}
                </div>
                <h3>{p.title}</h3>
                <p className="muted small">{p.source}</p>
              </button>
              {p.custom && (
                <button
                  className="icon-btn"
                  aria-label="削除"
                  onClick={() => confirm(`「${p.title}」を削除しますか？`) && onDelete(p.id)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
