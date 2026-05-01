import { useTodos } from './hooks/useTodos'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { FilterBar } from './components/FilterBar'

function App() {
  const {
    todos,
    allTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    changePriority,
    clearCompleted,
    activeCount,
    completedCount,
  } = useTodos()

  const total = allTodos.length
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="title-icon">
              <rect width="28" height="28" rx="8" fill="url(#grad)" />
              <path d="M7 14l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            TODO
          </h1>
          {total > 0 && (
            <div className="header-meta">
              <span className="meta-text">
                {activeCount > 0 ? `残り ${activeCount} 件` : 'すべて完了！'}
              </span>
              <div className="progress-wrap">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="meta-percent">{progress}%</span>
            </div>
          )}
        </header>

        <TodoInput onAdd={addTodo} />

        {total > 0 && (
          <FilterBar
            filter={filter}
            setFilter={setFilter}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
          />
        )}

        {todos.length > 0 ? (
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onPriority={changePriority}
          />
        ) : total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="14" fill="#f1f5f9" />
                <path d="M16 24h16M16 17h10M16 31h12" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="34" cy="32" r="6" fill="#6366f1" />
                <path d="M31 32l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="empty-title">タスクがありません</p>
            <p className="empty-sub">上のフォームからタスクを追加しましょう</p>
          </div>
        ) : (
          <div className="empty-filter">
            <p>このフィルターに該当するタスクはありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
