import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import type { Todo, Priority } from '../types/todo'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
  onPriority: (id: string, priority: Priority) => void
}

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; next: Priority }> = {
  high:   { color: '#ef4444', label: '高', next: 'medium' },
  medium: { color: '#f59e0b', label: '中', next: 'low' },
  low:    { color: '#22c55e', label: '低', next: 'high' },
}

export function TodoItem({ todo, onToggle, onDelete, onEdit, onPriority }: Props) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    if (todo.completed) return
    setEditText(todo.text)
    setEditing(true)
  }

  const saveEdit = () => {
    onEdit(todo.id, editText)
    setEditing(false)
  }

  const handleEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') {
      setEditing(false)
      setEditText(todo.text)
    }
  }

  const pCfg = PRIORITY_CONFIG[todo.priority]

  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}${editing ? ' editing' : ''}`}>
      <button
        className="checkbox"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'タスクを未完了に戻す' : 'タスクを完了にする'}
      >
        {todo.completed && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="todo-content">
        {editing ? (
          <input
            ref={inputRef}
            className="edit-input"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={handleEditKey}
            onBlur={saveEdit}
          />
        ) : (
          <span className="todo-text" onDoubleClick={startEdit} title={todo.completed ? '' : 'ダブルクリックで編集'}>
            {todo.text}
          </span>
        )}
      </div>

      <div className="todo-actions">
        <button
          className="priority-indicator"
          style={{ '--p-color': pCfg.color } as React.CSSProperties}
          onClick={() => onPriority(todo.id, pCfg.next)}
          title={`優先度：${pCfg.label}（クリックで変更）`}
        >
          <span className="priority-dot" />
        </button>
        <button className="delete-btn" onClick={() => onDelete(todo.id)} aria-label="削除">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  )
}
