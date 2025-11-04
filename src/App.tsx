import { useCallback, useMemo } from "react";
import { FilterTabs } from "./components/FilterTabs";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";
import type { Todo } from "./types/todo";

const suggestions = [
  "Organizar prioridades do dia",
  "Responder mensagens pendentes",
  "Revisar projeto em andamento",
];

const App = () => {
  const { filteredTodos, filter, setFilter, addTodo, toggleTodo, removeTodo, clearCompleted, updateTodo, reorderTodos, stats } = useTodos();

  const handleUpdate = useCallback(
    (id: string, changes: Partial<Pick<Todo, "content" | "description">>) => {
      updateTodo(id, changes);
    },
    [updateTodo],
  );

  const handleReorder = useCallback(
    (ids: string[]) => {
      reorderTodos(ids, filter);
    },
    [reorderTodos, filter],
  );

  const helperText = useMemo(() => {
    if (stats.total === 0) return suggestions[0];
    if (stats.active === 0) return "Tudo concluído por aqui";
    return suggestions[(stats.active - 1) % suggestions.length];
  }, [stats]);

  return (
    <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-slate-100">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Todoist</span>
          <h1 className="text-4xl font-bold tracking-tight">Faça acontecer</h1>
          <p className="text-sm text-slate-400">{helperText}</p>
        </header>
        <TodoForm onAdd={addTodo} />
        <section className="flex flex-1 flex-col gap-4 rounded-3xl border border-slate-900/60 bg-slate-950/60 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <FilterTabs filter={filter} onChange={setFilter} counts={stats} />
          <TodoList todos={filteredTodos} onToggle={toggleTodo} onRemove={removeTodo} onUpdate={handleUpdate} onReorder={handleReorder} />
          <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <span>{stats.active} pendentes • {stats.completed} concluídas</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompleted}
                disabled={stats.completed === 0}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-300 transition hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:bg-slate-900/70 disabled:text-slate-600"
              >
                Limpar concluídas
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default App;
