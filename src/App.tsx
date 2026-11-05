import { useEffect, useState } from 'react'
import type { Episode, ListenRecord } from './types'
import { podcastUrl } from './lib/format'
import { useLocalStorage } from './hooks/useLocalStorage'
import { EpisodeList } from './components/EpisodeList'
import { Player } from './components/Player'
import { Stats } from './components/Stats'

type Tab = 'episodes' | 'stats'

export default function App() {
  const [tab, setTab] = useState<Tab>('episodes')
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<{ episode: Episode; startAt: number } | null>(null)
  const [records, setRecords] = useLocalStorage<ListenRecord[]>('tadoku.listens', [])
  const [positions, setPositions] = useLocalStorage<Record<string, number>>('tadoku.positions', {})
  const [goal, setGoal] = useLocalStorage('tadoku.goal', 100_000)

  useEffect(() => {
    fetch(podcastUrl('index.json'))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setEpisodes)
      .catch((e: Error) => setError(e.message))
  }, [])

  const total = records.reduce((sum, r) => sum + r.words, 0)

  return (
    <div className="app">
      {open ? (
        <Player
          key={open.episode.id}
          episode={open.episode}
          startAt={open.startAt}
          onBack={() => setOpen(null)}
          onPosition={(sec) => setPositions((prev) => ({ ...prev, [open.episode.id]: sec }))}
          onFinish={(seconds) =>
            setRecords((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                episodeId: open.episode.id,
                title: open.episode.title,
                words: open.episode.words,
                seconds,
                finishedAt: new Date().toISOString(),
              },
            ])
          }
        />
      ) : (
        <>
          <header className="header">
            <h1>
              Podcast<span>Tadoku</span>
            </h1>
            <p className="muted small">英語ポッドキャストで多聴・多読 · 累計 {total.toLocaleString()} 語</p>
          </header>
          <nav className="tabs">
            <button className={tab === 'episodes' ? 'active' : ''} onClick={() => setTab('episodes')}>
              エピソード
            </button>
            <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>
              記録
            </button>
          </nav>
          {tab === 'episodes' ? (
            <EpisodeList
              episodes={episodes}
              error={error}
              records={records}
              positions={positions}
              onOpen={(ep) => setOpen({ episode: ep, startAt: positions[ep.id] ?? 0 })}
            />
          ) : (
            <Stats records={records} goal={goal} onGoalChange={setGoal} />
          )}
        </>
      )}
    </div>
  )
}
