import type { AnswerLog, ProblemSource } from '../types'

interface Props {
  problems: ProblemSource[]
  logs: AnswerLog[]
  onReset: () => void
}

export function Stats({ problems, logs, onReset }: Props) {
  const correct = logs.filter((l) => l.correct).length
  const latest = new Map<string, boolean>()
  for (const l of logs) latest.set(l.problemId, l.correct)
  const mastered = [...latest.values()].filter(Boolean).length

  const tags = [...new Set(problems.map((p) => p.tag))]
  const byTag = tags.map((tag) => {
    const ids = new Set(problems.filter((p) => p.tag === tag).map((p) => p.id))
    const tagLogs = logs.filter((l) => ids.has(l.problemId))
    const done = [...ids].filter((id) => latest.get(id)).length
    return {
      tag,
      total: ids.size,
      done,
      rate: tagLogs.length ? Math.round((tagLogs.filter((l) => l.correct).length / tagLogs.length) * 100) : null,
    }
  })

  return (
    <section>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">解いた回数</span>
          <strong>{logs.length}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">正答率</span>
          <strong>{logs.length ? Math.round((correct / logs.length) * 100) : 0}%</strong>
        </div>
        <div className="stat">
          <span className="stat-label">クリア</span>
          <strong>
            {mastered}
            <small>/{problems.length}</small>
          </strong>
        </div>
      </div>

      <h3 className="section-title">文法項目ごと</h3>
      <ul className="tag-stats">
        {byTag.map((t) => (
          <li key={t.tag}>
            <div className="tag-row">
              <span>{t.tag}</span>
              <span className="muted small">
                {t.done}/{t.total} クリア{t.rate !== null && ` · 正答率 ${t.rate}%`}
              </span>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${(t.done / t.total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="muted small">「クリア」は最後に解いたとき正解だった問題の数です。</p>

      {logs.length > 0 && (
        <button className="sub-btn reset" onClick={() => confirm('記録をすべて消しますか？') && onReset()}>
          記録をリセット
        </button>
      )}
    </section>
  )
}
