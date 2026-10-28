import { useState } from 'react'
import type { Passage, ReadingRecord, VocabEntry } from './types'
import { SAMPLES } from './data/samples'
import { PDF_PASSAGES } from './data/pdfPassages'
import { passageWords } from './lib/text'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Library } from './components/Library'
import { Reader } from './components/Reader'
import { ImportForm } from './components/ImportForm'
import { Stats } from './components/Stats'
import { Vocab } from './components/Vocab'

type Tab = 'library' | 'import' | 'vocab' | 'stats'

const TABS: { id: Tab; label: string }[] = [
  { id: 'library', label: 'ライブラリ' },
  { id: 'import', label: '取り込む' },
  { id: 'vocab', label: '単語帳' },
  { id: 'stats', label: '記録' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('library')
  const [openId, setOpenId] = useState<string | null>(null)
  const [custom, setCustom] = useLocalStorage<Passage[]>('tadoku.custom', [])
  const [records, setRecords] = useLocalStorage<ReadingRecord[]>('tadoku.records', [])
  const [vocab, setVocab] = useLocalStorage<VocabEntry[]>('tadoku.vocab', [])
  const [goal, setGoal] = useLocalStorage('tadoku.goal', 100_000)

  const passages = [...PDF_PASSAGES, ...SAMPLES, ...custom]
  const open = passages.find((p) => p.id === openId)
  const total = records.reduce((sum, r) => sum + r.words, 0)

  const finish = (p: Passage, seconds: number) => {
    setRecords((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        passageId: p.id,
        title: p.title,
        words: passageWords(p),
        seconds,
        finishedAt: new Date().toISOString(),
      },
    ])
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          Tech<span>Tadoku</span>
        </h1>
        <p className="muted small">規格と論文で英語多読 · 累計 {total.toLocaleString()} 語</p>
      </header>

      {open ? (
        <Reader
          key={open.id}
          passage={open}
          vocab={vocab}
          onBack={() => setOpenId(null)}
          onFinish={(sec) => finish(open, sec)}
          onAddVocab={(entry) => setVocab((prev) => [...prev.filter((v) => v.word !== entry.word), entry])}
        />
      ) : (
        <>
          <nav className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          {tab === 'library' && (
            <Library
              passages={passages}
              records={records}
              onOpen={setOpenId}
              onDelete={(id) => setCustom((prev) => prev.filter((p) => p.id !== id))}
            />
          )}
          {tab === 'import' && (
            <ImportForm
              onImport={(p) => {
                setCustom((prev) => [...prev, p])
                setOpenId(p.id)
              }}
            />
          )}
          {tab === 'vocab' && (
            <Vocab vocab={vocab} onDelete={(word) => setVocab((prev) => prev.filter((v) => v.word !== word))} />
          )}
          {tab === 'stats' && <Stats records={records} goal={goal} onGoalChange={setGoal} />}
        </>
      )}
    </div>
  )
}
