import type { Episode, ListenRecord } from '../types'
import { formatTime, speakingWpm } from '../lib/format'

interface Props {
  episodes: Episode[] | null
  error: string | null
  records: ListenRecord[]
  positions: Record<string, number>
  onOpen: (ep: Episode) => void
}

export function EpisodeList({ episodes, error, records, positions, onOpen }: Props) {
  if (error) return <p className="empty">エピソード一覧を読み込めませんでした（{error}）</p>
  if (!episodes) return <p className="empty">読み込み中…</p>
  if (episodes.length === 0) {
    return (
      <div className="empty">
        <p>まだエピソードがありません。</p>
        <p className="small">
          GitHub の <code>content/podcasts/</code> に音声ファイルをアップロードすると、
          <br />
          自動で文字起こし・和訳されてここに並びます。
        </p>
      </div>
    )
  }

  const plays = new Map<string, number>()
  for (const r of records) plays.set(r.episodeId, (plays.get(r.episodeId) ?? 0) + 1)

  return (
    <ul className="card-list">
      {episodes.map((ep) => {
        const pos = positions[ep.id] ?? 0
        return (
          <li key={ep.id}>
            <button className="card" onClick={() => onOpen(ep)}>
              <h3>{ep.title}</h3>
              <div className="card-meta">
                <span>{formatTime(ep.duration)}</span>
                <span>{ep.words.toLocaleString()} 語</span>
                <span>{speakingWpm(ep.words, ep.duration)} WPM</span>
                {ep.translated && <span className="badge">和訳</span>}
                {plays.has(ep.id) && <span className="played">✓ {plays.get(ep.id)}回</span>}
              </div>
              {pos > 0 && (
                <div className="mini-bar" aria-label="続きから">
                  <div style={{ width: `${Math.min(100, (pos / ep.duration) * 100)}%` }} />
                </div>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
