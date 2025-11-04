export type TodoFilter = "all" | "active" | "completed";

export type Todo = {
  id: string;
  content: string;
  description: string;
  completed: boolean;
  createdAt: number;
};
