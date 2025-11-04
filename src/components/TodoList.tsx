import { useEffect, useMemo, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types/todo";

type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Pick<Todo, "content" | "description">>) => void;
  onReorder: (ids: string[]) => void;
};

export const TodoList = ({ todos, onToggle, onRemove, onUpdate, onReorder }: TodoListProps) => {
  const [order, setOrder] = useState(() => todos.map((item) => item.id));

  useEffect(() => {
    setOrder(todos.map((item) => item.id));
  }, [todos]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const nextOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(nextOrder);
    onReorder(nextOrder);
  };

  const registry = useMemo(() => new Map(todos.map((item) => [item.id, item] as const)), [todos]);
  const orderedTodos = useMemo(
    () => order.map((id) => registry.get(id)).filter((item): item is Todo => Boolean(item)),
    [order, registry],
  );

  if (orderedTodos.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center text-sm text-slate-500">
        Nada por aqui. Adicione uma tarefa para começar.
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {orderedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onRemove={onRemove} onUpdate={onUpdate} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};
