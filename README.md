# Todoist-style Task Manager

React + TypeScript + Vite application inspired by Todoist, featuring drag-and-drop reordering, smart filters, Tailwind styling, and optional Groq-powered description suggestions.

## Features

- Task creation with instant persistence in `localStorage`
- Filters for all, active, and completed tasks, plus quick clear for completed items
- Drag-and-drop reordering that respects the active filter view
- Expandable task details with editable descriptions
- **AI assist** button that asks Groq's `llama-3.1-8b-instant` for a suggested description and subtasks

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (see [AI setup](#ai-setup)).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## AI Setup

1. Crie uma API key em [groq.com](https://console.groq.com/keys).
2. Copie `.env.example` para `.env` e preencha os valores:
   ```bash
   cp .env.example .env
   ```
3. Atualize `.env`:
   ```dotenv
   VITE_GROQ_API_KEY="sua-chave"
   # Opcional: sobrescreva o modelo padrão
   # VITE_GROQ_MODEL="llama-3.1-8b-instant"
   ```
4. Reinicie `npm run dev` após alterar variáveis de ambiente.

O recurso de IA é opcional — sem a chave, o app continua funcionando, mas o botão de sugestão exibirá que a configuração está ausente.

## Scripts

- `npm run lint` – run ESLint
- `npm run dev` – start Vite in development mode
- `npm run build` – compile the project
- `npm run preview` – preview the production build

## License

MIT
