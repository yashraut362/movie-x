"use client";
import React, { useEffect, useRef, useState } from "react";
import router from "next/router";
import { Menu, MenuItem } from "@/components/ui/navbar";
import MessageList, { Message } from "@/components/chat/MessageList";
import Composer from "@/components/chat/Composer";
import { askMovieX, ChatTurn } from "@/lib/askMovieX";
import { cn } from "@/utils/cn";

const EXAMPLES = [
  "Something tense I can't predict the ending of",
  "A movie about food that makes me want to cook",
  "Best Korean films to start with",
  "A slow-burn thriller for a rainy night",
];

let counter = 0;
const nextId = () => `${Date.now()}-${counter++}`;

export default function Ask() {
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (text: string) => {
    if (busy) return;
    setBusy(true);

    const history: ChatTurn[] = messages.map((m) => ({ role: m.role, text: m.text }));
    const userMsg: Message = { id: nextId(), role: "user", text };
    const assistantId = nextId();
    const pending: Message = { id: assistantId, role: "assistant", text: "", loading: true };
    setMessages((prev) => [...prev, userMsg, pending]);

    // Replace the pending assistant message once the answer arrives.
    const finish = (update: Partial<Message>) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...update, loading: false } : m)));

    try {
      const answer = await askMovieX(text, history);
      finish({ text: answer.text, picks: answer.picks });
    } catch (err) {
      console.error("askMovieX failed:", err);
      finish({ text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white antialiased">
      <div className="relative w-full flex items-center justify-center">
        <div className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50 top-2")}>
          <Menu setActive={setActive}>
            <div onClick={() => router.push(`/`)}>
              <MenuItem setActive={setActive} active={null} item="Home" />
            </div>
            <div onClick={() => router.push(`/book`)}>
              <MenuItem setActive={setActive} active={null} item="Book" />
            </div>
            <div onClick={() => router.push(`/ask`)}>
              <MenuItem setActive={setActive} active={null} item="Ask" />
            </div>
            <div onClick={() => window.open("https://yashraut.me")}>
              <MenuItem setActive={setActive} active={null} item="About" />
            </div>
          </Menu>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-40 pt-32">
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              Ask MovieX RAG
            </h1>
            <p className="mt-4 max-w-md text-base text-neutral-400 md:text-lg">
              Your question is embedded with OpenAI, matched against movie vectors in Pinecone, and the top hits are handed to the model with a strict JSON schema so it can only recommend films it actually retrieved.
            </p>
            <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => send(ex)}
                  className="rounded-[20px] border border-white/10 bg-[#1F2121] px-4 py-3 text-left text-sm text-neutral-200 transition hover:border-emerald-500/60 hover:bg-[#232525] hover:text-white"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={bottomRef} />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent px-4 pb-6 pt-10">
        <div className="mx-auto w-full max-w-5xl">
          <Composer onSend={send} disabled={busy} />
        </div>
      </div>
    </div>
  );
}
