import type { Todo, Priority } from '../types/todo'
import { TodoItem } from './TodoItem'

interface Props {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
  onPriority: (id: string, priority: Priority) => void
}

export function TodoList({ todos, onToggle, onDelete, onEdit, onPriority }: Props) {
  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onPriority={onPriority}
        />
      ))}
    </ul>
  )
}
