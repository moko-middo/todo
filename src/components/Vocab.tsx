import type { VocabEntry } from '../types'

interface Props {
  vocab: VocabEntry[]
  onDelete: (word: string) => void
}

export function Vocab({ vocab, onDelete }: Props) {
  if (vocab.length === 0) {
    return <p className="empty">本文中の単語をタップすると、意味の確認と単語帳への登録ができます。</p>
  }

  return (
    <ul className="vocab-list">
      {[...vocab].reverse().map((v) => (
        <li key={v.word} className="card vocab">
          <div>
            <div className="vocab-head">
              <strong>{v.word}</strong>
              <span>{v.meaning || <span className="muted">（意味未入力）</span>}</span>
            </div>
            <p className="muted small context">{v.context}</p>
          </div>
          <button className="icon-btn" aria-label="削除" onClick={() => onDelete(v.word)}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
