import { useState } from "react";
import type { FormEvent } from "react";

type TodoFormProps = {
  onAdd: (content: string) => void;
};

export const TodoForm = ({ onAdd }: TodoFormProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full bg-slate-900 px-6 py-4 shadow-lg shadow-black/30"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-700 text-slate-600">
        +
      </span>
      <input
        type="text"
        value={value}
        placeholder="Adicionar tarefa"
        onChange={(event) => setValue(event.target.value)}
        className="flex-1 border-none bg-transparent text-base text-slate-100 placeholder:text-slate-500 outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        Adicionar
      </button>
    </form>
  );
};
