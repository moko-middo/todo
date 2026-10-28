import type { ReadingRecord } from '../types'

interface Props {
  records: ReadingRecord[]
  goal: number
  onGoalChange: (goal: number) => void
}

const GOALS = [100_000, 300_000, 1_000_000, 3_000_000]

export function Stats({ records, goal, onGoalChange }: Props) {
  const total = records.reduce((sum, r) => sum + r.words, 0)
  const seconds = records.reduce((sum, r) => sum + r.seconds, 0)
  const avgWpm = seconds > 0 ? Math.round((total / seconds) * 60) : 0
  const progress = Math.min(100, (total / goal) * 100)

  return (
    <section>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">累計語数</span>
          <strong>{total.toLocaleString()}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">読んだ回数</span>
          <strong>{records.length}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">平均 WPM</span>
          <strong>{avgWpm}</strong>
        </div>
      </div>

      <div className="goal">
        <div className="goal-head">
          <span>
            目標{' '}
            <select value={goal} onChange={(e) => onGoalChange(Number(e.target.value))}>
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g.toLocaleString()} 語
                </option>
              ))}
            </select>
          </span>
          <span className="muted">{progress.toFixed(1)}%</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h3 className="section-title">履歴</h3>
      {records.length === 0 ? (
        <p className="empty">まだ記録がありません。ライブラリから1本読んでみましょう。</p>
      ) : (
        <ul className="history">
          {[...records].reverse().map((r) => (
            <li key={r.id}>
              <span className="history-title">{r.title}</span>
              <span className="muted small">
                {new Date(r.finishedAt).toLocaleDateString('ja-JP')} · {r.words} 語 ·{' '}
                {Math.round((r.words / r.seconds) * 60)} WPM
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
