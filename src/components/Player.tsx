import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { Episode, Sentence, Transcript } from '../types'
import { formatTime, podcastUrl, speakingWpm } from '../lib/format'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface Props {
  episode: Episode
  startAt: number
  onBack: () => void
  onPosition: (sec: number) => void
  onFinish: (seconds: number) => void
}

interface Settings {
  rate: number
  autoScroll: boolean
  showJa: boolean
  hideText: boolean
}

const RATES = [0.75, 0.85, 1, 1.15, 1.25, 1.5]
/** 手でスクロールしたあと、自動スクロールを止めておく時間 */
const MANUAL_SCROLL_PAUSE = 5000

/** start <= t を満たす最後の要素の位置（なければ -1） */
function lastStartedBefore(items: { start: number }[] | [number, ...unknown[]][], t: number) {
  let lo = 0
  let hi = items.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const it = items[mid]
    const start = Array.isArray(it) ? it[0] : it.start
    if (start <= t) {
      ans = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  return ans
}

export function Player({ episode, startAt, onBack, onPosition, onFinish }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(startAt)
  const [cur, setCur] = useState({ s: -1, w: -1 })
  const [openJa, setOpenJa] = useState<Set<number>>(new Set())
  const [loop, setLoop] = useState<number | null>(null)
  const [settings, setSettings] = useLocalStorage<Settings>('tadoku.player', {
    rate: 1,
    autoScroll: true,
    showJa: false,
    hideText: false,
  })
  const manualScrollUntil = useRef(0)
  const loopRef = useRef(loop)
  loopRef.current = loop

  const sentences = transcript?.sentences

  useEffect(() => {
    fetch(podcastUrl(episode.transcript))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setTranscript)
      .catch((e: Error) => setError(e.message))
  }, [episode.transcript])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = settings.rate
  }, [settings.rate])

  // 再生中は毎フレーム現在位置を見て、ハイライトする文・単語を決める
  useEffect(() => {
    if (!sentences) return
    let raf = 0
    let lastShown = -1
    const tick = () => {
      const audio = audioRef.current
      if (audio) {
        let t = audio.currentTime
        const l = loopRef.current
        if (l !== null && t >= sentences[l].end) {
          audio.currentTime = t = sentences[l].start
        }
        const s = lastStartedBefore(sentences, t)
        const w = s >= 0 ? lastStartedBefore(sentences[s].words, t) : -1
        setCur((prev) => (prev.s === s && prev.w === w ? prev : { s, w }))
        if (Math.abs(t - lastShown) >= 0.25) {
          lastShown = t
          setTime(t)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sentences])

  // 自動スクロール
  useEffect(() => {
    if (!settings.autoScroll || cur.s < 0 || Date.now() < manualScrollUntil.current) return
    document.querySelector(`[data-sentence="${cur.s}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [cur.s, settings.autoScroll])

  useEffect(() => {
    const pause = () => (manualScrollUntil.current = Date.now() + MANUAL_SCROLL_PAUSE)
    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('touchmove', pause, { passive: true })
    return () => {
      window.removeEventListener('wheel', pause)
      window.removeEventListener('touchmove', pause)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }, [])

  const skip = useCallback((sec: number) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = Math.max(0, Math.min(audio.duration || Infinity, audio.currentTime + sec))
  }, [])

  const seekTo = useCallback(
    (i: number) => {
      const audio = audioRef.current
      if (!audio || !sentences) return
      manualScrollUntil.current = 0
      audio.currentTime = sentences[i].start
      setLoop((l) => (l === null ? null : i))
      void audio.play()
    },
    [sentences],
  )

  const toggleJa = useCallback((i: number) => {
    setOpenJa((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }, [])

  // キーボード操作: スペース=再生/一時停止, ←→=5秒
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowLeft') skip(-5)
      else if (e.key === 'ArrowRight') skip(5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, skip])

  // ロック画面・イヤホンのボタン
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: episode.title, artist: 'Podcast Tadoku' })
    navigator.mediaSession.setActionHandler('seekbackward', () => skip(-5))
    navigator.mediaSession.setActionHandler('seekforward', () => skip(5))
  }, [episode.title, skip])

  const lastSaved = useRef(startAt)
  const savePosition = (t: number, force = false) => {
    if (force || Math.abs(t - lastSaved.current) > 3) {
      lastSaved.current = t
      onPosition(t)
    }
  }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  return (
    <div className="player">
      <div className="player-top">
        <button className="link-btn" onClick={onBack}>
          ← 一覧へ
        </button>
        <h2>{episode.title}</h2>
        <p className="muted small">
          {formatTime(episode.duration)} · {episode.words.toLocaleString()} 語 ·{' '}
          {speakingWpm(episode.words, episode.duration)} WPM
        </p>
        <div className="toggles">
          <Toggle on={settings.autoScroll} onClick={() => set('autoScroll', !settings.autoScroll)}>
            自動スクロール
          </Toggle>
          <Toggle on={settings.showJa} onClick={() => set('showJa', !settings.showJa)}>
            全文和訳
          </Toggle>
          <Toggle on={settings.hideText} onClick={() => set('hideText', !settings.hideText)}>
            英文を隠す
          </Toggle>
        </div>
      </div>

      {error && <p className="empty">文字起こしを読み込めませんでした（{error}）</p>}
      {!transcript && !error && <p className="empty">読み込み中…</p>}

      {sentences && (
        <div className={`transcript${settings.hideText ? ' hide-text' : ''}`}>
          {sentences.map((s, i) => (
            <SentenceRow
              key={i}
              index={i}
              sentence={s}
              active={i === cur.s}
              activeWord={i === cur.s ? cur.w : -1}
              showJa={settings.showJa !== openJa.has(i)}
              looping={loop === i}
              onSeek={seekTo}
              onToggleJa={toggleJa}
            />
          ))}
        </div>
      )}

      <div className="controls">
        <div className="seek-row">
          <span className="time">{formatTime(time)}</span>
          <input
            type="range"
            min={0}
            max={episode.duration}
            step={0.1}
            value={time}
            onChange={(e) => {
              const t = Number(e.target.value)
              if (audioRef.current) audioRef.current.currentTime = t
              setTime(t)
              manualScrollUntil.current = 0
            }}
            aria-label="再生位置"
          />
          <span className="time">{formatTime(episode.duration)}</span>
        </div>
        <div className="button-row">
          <select value={settings.rate} onChange={(e) => set('rate', Number(e.target.value))} aria-label="再生速度">
            {RATES.map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
          <button className="ctl" onClick={() => skip(-5)} aria-label="5秒戻る">
            ↺5
          </button>
          <button className="ctl play" onClick={togglePlay} aria-label={playing ? '一時停止' : '再生'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button className="ctl" onClick={() => skip(5)} aria-label="5秒進む">
            5↻
          </button>
          <button
            className={`ctl loop${loop !== null ? ' on' : ''}`}
            onClick={() => setLoop((l) => (l === null ? Math.max(0, cur.s) : null))}
            aria-label="今の文をくり返す"
            title="今の文をくり返す（シャドーイング用）"
          >
            🔁
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={podcastUrl(episode.audio)}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget
          audio.playbackRate = settings.rate
          if (startAt > 0 && startAt < audio.duration - 5) audio.currentTime = startAt
        }}
        onPlay={() => setPlaying(true)}
        onPause={(e) => {
          setPlaying(false)
          savePosition(e.currentTarget.currentTime, true)
        }}
        onTimeUpdate={(e) => savePosition(e.currentTarget.currentTime)}
        onEnded={(e) => {
          setLoop(null)
          savePosition(0, true)
          onFinish(Math.round(e.currentTarget.duration))
        }}
      />
    </div>
  )
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`toggle${on ? ' on' : ''}`} onClick={onClick} aria-pressed={on}>
      {children}
    </button>
  )
}

interface RowProps {
  index: number
  sentence: Sentence
  active: boolean
  activeWord: number
  showJa: boolean
  looping: boolean
  onSeek: (i: number) => void
  onToggleJa: (i: number) => void
}

const SentenceRow = memo(function SentenceRow({
  index,
  sentence,
  active,
  activeWord,
  showJa,
  looping,
  onSeek,
  onToggleJa,
}: RowProps) {
  return (
    <div className={`sentence${active ? ' active' : ''}${looping ? ' looping' : ''}`} data-sentence={index}>
      <button className="seek-btn" onClick={() => onSeek(index)} aria-label="この文から再生">
        ▶
      </button>
      <div className="sentence-body" onClick={() => onToggleJa(index)}>
        <p className="en">
          {sentence.words.map(([, , w], j) => (
            <span key={j}>
              {j > 0 && /^\s/.test(w) ? ' ' : ''}
              <span className={j === activeWord ? 'word now' : j < activeWord ? 'word done' : 'word'}>
                {w.trim()}
              </span>
            </span>
          ))}
        </p>
        {showJa && (
          <p className="ja">
            {sentence.ja ?? (
              <a
                href={`https://translate.google.com/?sl=en&tl=ja&op=translate&text=${encodeURIComponent(sentence.text)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Google 翻訳で見る
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  )
})
