export function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** 話す速さ（1 分あたりの語数）。ネイティブの会話でおよそ 150〜180 */
export function speakingWpm(words: number, seconds: number) {
  return seconds > 0 ? Math.round((words / seconds) * 60) : 0
}

export const podcastUrl = (file: string) => `${import.meta.env.BASE_URL}podcasts/${encodeURIComponent(file)}`
