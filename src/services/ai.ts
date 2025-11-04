const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status: number) => [408, 409, 425, 429, 500, 502, 503, 504].includes(status);

const getApiKey = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GROQ_API_KEY não está configurada.");
  }
  return apiKey;
};

const getModel = () => import.meta.env.VITE_GROQ_MODEL ?? DEFAULT_MODEL;

const buildPrompt = (title: string) =>
  `Você é um assistente de produtividade. Crie uma descrição curta (máx. 3 frases) e uma lista de 3 subtarefas em Markdown para a tarefa: "${title}". Responda em português.`;

export const suggestDescription = async (title: string, attempts = 3) => {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Informe um título para gerar uma sugestão.");
  }

  const body = {
    model: getModel(),
    temperature: 0.9,
    max_completion_tokens: 400,
    stream: false,
    messages: [
      {
        role: "system" as const,
        content: "Você auxilia na organização de tarefas. Seja objetivo e use Markdown simples.",
      },
      {
        role: "user" as const,
        content: buildPrompt(trimmed),
      },
    ],
  };

  const apiKey = getApiKey();
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        lastError = new Error(`${response.status} ${response.statusText}`);
        if (!isRetryableStatus(response.status) || attempt === attempts) {
          throw lastError;
        }
      } else {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
        throw new Error("Não recebi sugestão do modelo.");
      }
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
    }

    const waitTime = Math.min(1000 * 2 ** (attempt - 1), 8000);
    await sleep(waitTime + Math.random() * 250);
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError ?? "Erro desconhecido");
  throw new Error(`Não foi possível gerar sugestão: ${message}`);
};
