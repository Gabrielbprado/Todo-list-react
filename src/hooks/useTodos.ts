import { useCallback, useEffect, useMemo, useState } from "react";
import type { Todo, TodoFilter } from "../types/todo";

const STORAGE_KEY = "todoist:data";

const loadTodos = (): Todo[] => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as Todo[];
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          id: item.id,
          content: item.content,
          description: item.description ?? "",
          completed: item.completed,
          createdAt: item.createdAt,
        }))
      : [];
  } catch {
    return [];
  }
};

const persistTodos = (todos: Todo[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const createTodo = (content: string): Todo => ({
  id: crypto.randomUUID(),
  content,
  description: "",
  completed: false,
  createdAt: Date.now(),
});

const matchesFilter = (todo: Todo, filter: TodoFilter) => {
  if (filter === "active") return !todo.completed;
  if (filter === "completed") return todo.completed;
  return true;
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [filter, setFilter] = useState<TodoFilter>("all");

  useEffect(() => {
    persistTodos(todos);
  }, [todos]);

  const addTodo = useCallback((content: string) => {
    setTodos((current) => [createTodo(content), ...current]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((current) =>
      current.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((current) => current.filter((item) => !item.completed));
  }, []);

  const updateTodo = useCallback((id: string, changes: Partial<Pick<Todo, "content" | "description">>) => {
    setTodos((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }, []);

  const reorderTodos = useCallback((orderedIds: string[], currentFilter: TodoFilter) => {
    setTodos((current) => {
      const filteredCurrent = current.filter((item) => matchesFilter(item, currentFilter));
      if (filteredCurrent.length !== orderedIds.length) return current;
      const registry = new Map(current.map((item) => [item.id, item] as const));
      const reordered = orderedIds
        .map((id) => registry.get(id))
        .filter((item): item is Todo => Boolean(item));
      if (reordered.length !== filteredCurrent.length) return current;
      let pointer = 0;
      return current.map((item) => {
        if (!matchesFilter(item, currentFilter)) return item;
        const next = reordered[pointer];
        pointer += 1;
        return next ?? item;
      });
    });
  }, []);

  const filteredTodos = useMemo(() => todos.filter((item) => matchesFilter(item, filter)), [filter, todos]);

  const stats = useMemo(() => {
    const active = todos.filter((item) => !item.completed).length;
    const completed = todos.length - active;
    return { active, completed, total: todos.length };
  }, [todos]);

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
    updateTodo,
    reorderTodos,
    stats,
  };
};
