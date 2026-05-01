import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Priority } from '../types/todo'

interface Props {
  onAdd: (text: string, priority: Priority) => void
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: '#ef4444' },
  { value: 'medium', label: '中', color: '#f59e0b' },
  { value: 'low', label: '低', color: '#22c55e' },
]

export function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleAdd = () => {
    if (!text.trim()) return
    onAdd(text, priority)
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="input-card">
      <div className="input-row">
        <input
          className="todo-input"
          type="text"
          placeholder="新しいタスクを入力..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="add-btn"
          onClick={handleAdd}
          disabled={!text.trim()}
          aria-label="タスクを追加"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="priority-row">
        <span className="priority-label">優先度：</span>
        {PRIORITIES.map(p => (
          <button
            key={p.value}
            className={`priority-btn ${priority === p.value ? 'active' : ''}`}
            style={{ '--p-color': p.color } as React.CSSProperties}
            onClick={() => setPriority(p.value)}
          >
            <span className="priority-dot" />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
