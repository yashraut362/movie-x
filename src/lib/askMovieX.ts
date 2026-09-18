import axios from "axios";
import { API_URL } from "@/lib/api";

export type Pick = { tmdbId: number; why: string };
export type Answer = { text: string; picks: Pick[] };
export type ChatTurn = { role: "user" | "assistant"; text: string };

// Asks the backend for recommendations. Returns the answer text and the picks
// to show as cards. The backend does the search and the model call.
export async function askMovieX(question: string, history: ChatTurn[] = []): Promise<Answer> {
  const res = await axios.post<Answer>(`${API_URL}/api/ask`, { question, history });
  return res.data;
}
