import clsx from "clsx";
import type { TodoFilter } from "../types/todo";

type FilterTabsProps = {
  filter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
  counts: {
    total: number;
    active: number;
    completed: number;
  };
};

const options: { value: TodoFilter; label: string; badge: keyof FilterTabsProps["counts"] }[] = [
  { value: "all", label: "Todas", badge: "total" },
  { value: "active", label: "Ativas", badge: "active" },
  { value: "completed", label: "Concluídas", badge: "completed" },
];

export const FilterTabs = ({ filter, onChange, counts }: FilterTabsProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900 px-3 py-2 text-sm text-slate-400 shadow-inner shadow-black/20">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 transition",
            filter === option.value
              ? "bg-primary/10 text-primary"
              : "hover:text-slate-200",
          )}
        >
          <span>{option.label}</span>
          <span
            className={clsx(
              "min-w-6 rounded-full px-2 py-0.5 text-xs",
              filter === option.value ? "bg-primary text-slate-950" : "bg-slate-800 text-slate-300",
            )}
          >
            {counts[option.badge]}
          </span>
        </button>
      ))}
    </div>
  );
};
