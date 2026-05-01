import type { FilterType } from '../types/todo'

interface Props {
  filter: FilterType
  setFilter: (f: FilterType) => void
  activeCount: number
  completedCount: number
  onClearCompleted: () => void
}

export function FilterBar({ filter, setFilter, activeCount, completedCount, onClearCompleted }: Props) {
  const total = activeCount + completedCount
  return (
    <div className="filter-bar">
      <div className="filter-tabs">
        {([['all', 'すべて', total], ['active', '未完了', activeCount], ['completed', '完了済み', completedCount]] as const).map(
          ([value, label, count]) => (
            <button
              key={value}
              className={`filter-tab ${filter === value ? 'active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
              <span className="filter-count">{count}</span>
            </button>
          )
        )}
      </div>
      {completedCount > 0 && (
        <button className="clear-btn" onClick={onClearCompleted}>
          完了済みを削除
        </button>
      )}
    </div>
  )
}
