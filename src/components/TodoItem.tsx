import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { KeyboardEvent } from "react";
import type { Todo } from "../types/todo";
import { suggestDescription } from "../services/ai";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Pick<Todo, "content" | "description">>) => void;
};

export const TodoItem = ({ todo, onToggle, onRemove, onUpdate }: TodoItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const [open, setOpen] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(todo.description);
  const [titleDraft, setTitleDraft] = useState(todo.content);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDescriptionDraft(todo.description);
  }, [todo.description]);

  useEffect(() => {
    setTitleDraft(todo.content);
  }, [todo.content]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveDescription = () => {
    onUpdate(todo.id, { description: descriptionDraft.trim() });
    setAiError(null);
  };

  const handleCancelDescription = () => {
    setDescriptionDraft(todo.description);
    setOpen(false);
    setAiError(null);
  };

  const handleStartTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleCancelTitleEdit = () => {
    setTitleDraft(todo.content);
    setIsEditingTitle(false);
  };

  const handleConfirmTitleEdit = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setTitleDraft(todo.content);
      setIsEditingTitle(false);
      return;
    }
    if (trimmed !== todo.content) {
      onUpdate(todo.id, { content: trimmed });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleConfirmTitleEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancelTitleEdit();
    }
  };

  const handleSuggest = async () => {
    setAiError(null);
    try {
      setAiLoading(true);
      const suggestion = await suggestDescription(todo.content);
      setDescriptionDraft(suggestion);
      setOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível gerar a sugestão.";
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx(
        "group flex flex-col gap-3 rounded-2xl bg-slate-900 px-5 py-4 shadow-lg shadow-black/20",
        isDragging ? "opacity-80 ring-2 ring-primary" : "",
      )}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          className={clsx(
            "mt-1 flex h-9 w-9 items-center justify-center rounded-full border-2 transition",
            todo.completed
              ? "border-primary bg-primary text-slate-950"
              : "border-slate-700 text-slate-500 hover:border-primary hover:text-primary",
          )}
          aria-label={todo.completed ? "Marcar como pendente" : "Marcar como concluída"}
        >
          {todo.completed ? "✓" : ""}
        </button>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={handleConfirmTitleEdit}
                onKeyDown={handleTitleKeyDown}
                maxLength={160}
                className={clsx(
                  "w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-100 outline-none",
                  "focus:border-primary",
                )}
                aria-label="Editar título da tarefa"
              />
            ) : (
              <p
                onDoubleClick={handleStartTitleEdit}
                className={clsx(
                  "cursor-text text-base text-slate-100 transition",
                  todo.completed ? "text-slate-500 line-through" : "",
                )}
                title="Clique duas vezes para editar"
              >
                {todo.content}
              </p>
            )}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={isEditingTitle ? handleConfirmTitleEdit : handleStartTitleEdit}
                className={clsx(
                  "h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-slate-100",
                  isEditingTitle ? "flex" : "hidden group-hover:flex",
                )}
                aria-label={isEditingTitle ? "Salvar novo título" : "Editar título"}
              >
                {isEditingTitle ? "✓" : "✎"}
              </button>
              {isEditingTitle && (
                <button
                  type="button"
                  onClick={handleCancelTitleEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-slate-100"
                  aria-label="Cancelar edição do título"
                >
                  ↺
                </button>
              )}
              <button
                type="button"
                {...listeners}
                {...attributes}
                className={clsx(
                  "h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-lg text-slate-300 transition hover:bg-slate-700 hover:text-slate-100",
                  isEditingTitle ? "hidden" : "hidden group-hover:flex",
                )}
                aria-label="Reordenar tarefa"
              >
                ☰
              </button>
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition group-hover:flex hover:bg-slate-700 hover:text-slate-100"
                aria-label={open ? "Fechar detalhes" : "Abrir detalhes"}
              >
                {open ? "−" : "≡"}
              </button>
              <button
                type="button"
                onClick={() => onRemove(todo.id)}
                className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition group-hover:flex hover:bg-red-500 hover:text-white"
                aria-label="Remover tarefa"
              >
                ×
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-500">{new Date(todo.createdAt).toLocaleString()}</span>
          {!open && todo.description && (
            <p className="max-h-24 overflow-hidden whitespace-pre-line break-words text-sm text-slate-400">
              {todo.description}
            </p>
          )}
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-800 pt-3">
          <textarea
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            placeholder="Adicione uma descrição detalhada"
            className="min-h-28 w-full resize-y rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-primary"
          />
          <div className="flex items-start justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handleSuggest}
              disabled={aiLoading}
              className="rounded-full bg-slate-800 px-4 py-2 font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-900 disabled:text-slate-500"
            >
              {aiLoading ? "Gerando..." : "Sugerir com IA"}
            </button>
            {aiError && <span className="text-red-400">{aiError}</span>}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelDescription}
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveDescription}
              disabled={descriptionDraft.trim() === todo.description.trim()}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </li>
  );
};
