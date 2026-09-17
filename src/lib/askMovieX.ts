import { API_URL } from "@/lib/api";

export type Pick = { tmdbId: number; why: string };

export type AskEvent =
  | { type: "text"; text: string }
  | { type: "picks"; picks: Pick[] }
  | { type: "done" };

export type ChatTurn = { role: "user" | "assistant"; text: string };

// Streams ndjson events from POST /api/ask. The chat UI only consumes this
// generator, so swapping the server's recommender never touches the UI.
export async function* askMovieX(question: string, history: ChatTurn[] = []): AsyncGenerator<AskEvent> {
  const res = await fetch(`${API_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  if (!res.ok || !res.body) throw new Error(`ask failed with status ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) yield JSON.parse(line) as AskEvent;
    }
  }
  const rest = buffer.trim();
  if (rest) yield JSON.parse(rest) as AskEvent;
}
