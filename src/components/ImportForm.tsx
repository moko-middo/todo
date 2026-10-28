import { useState } from 'react'
import type { Category, Passage } from '../types'
import { SOURCE_LINKS } from '../data/samples'
import { countWords, splitParagraphs } from '../lib/text'

interface Props {
  onImport: (p: Passage) => void
}

export function ImportForm({ onImport }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('standard')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [body, setBody] = useState('')

  const words = countWords(body)
  const canSubmit = title.trim() !== '' && words > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onImport({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      source: source.trim() || '自分で取り込んだ文書',
      sourceUrl: sourceUrl.trim() || undefined,
      paragraphs: splitParagraphs(body),
      custom: true,
    })
  }

  return (
    <section>
      <form className="import-form" onSubmit={submit}>
        <label>
          タイトル
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: RFC 9110 HTTP Semantics §1" />
        </label>
        <div className="segmented">
          {(['standard', 'paper'] as Category[]).map((c) => (
            <button type="button" key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>
              {c === 'standard' ? '規格' : '論文'}
            </button>
          ))}
        </div>
        <label>
          出典（任意）
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="例: IETF RFC 9110, Section 1" />
        </label>
        <label>
          URL（任意）
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
        </label>
        <label>
          本文（空行で段落を区切ります。PDFからのコピーの行中改行は自動でつなげます）
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} />
        </label>
        <div className="form-foot">
          <span className="muted">{words.toLocaleString()} 語</span>
          <button className="primary-btn" type="submit" disabled={!canSubmit}>
            ライブラリに追加
          </button>
        </div>
        <p className="muted small">取り込んだ文書はこのブラウザ内だけに保存され、外部には送信されません。</p>
      </form>

      <h3 className="section-title">文書の入手先</h3>
      <ul className="source-links">
        {SOURCE_LINKS.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.name}
            </a>
            <span className="muted small"> — {s.note}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
