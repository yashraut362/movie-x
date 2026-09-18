"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Menu, MenuItem } from "@/components/ui/navbar";
import { MovieCard, type Movie } from "@/components/movie-card";
import { MovieGridSkeleton } from "@/components/ui/movie-card-skeleton";
import MessageList, { Message } from "@/components/chat/MessageList";
import Composer from "@/components/chat/Composer";
import { askConcierge, getNowPlaying, type ConciergeTurn } from "@/lib/api";
import { cn } from "@/utils/cn";

type Tab = "releases" | "concierge";

const EXAMPLES = [
  "Book the first row for a horror movie tonight for 2 people at PVR Phoenix",
  "Get me two seats in the middle for a comedy this afternoon at INOX Nexus",
  "Book one corner seat for the best rated movie at the latest show at Cinepolis Seasons",
  "Find a thriller playing this evening and book a middle row seat wherever it is free",
];

let counter = 0;
const nextId = () => `${Date.now()}-${counter++}`;

export default function Book() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("releases");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNowPlaying()
      .then((data) => setMovies(data.results))
      .catch((error) => {
        console.error("Error fetching now playing:", error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (text: string) => {
    if (busy) return;
    setBusy(true);

    const history: ConciergeTurn[] = messages.map((m) => ({ role: m.role, text: m.text }));
    const assistantId = nextId();
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text },
      { id: assistantId, role: "assistant", text: "", loading: true },
    ]);

    // Replace the pending assistant bubble once the reply arrives.
    const finish = (update: Partial<Message>) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...update, loading: false } : m)));

    try {
      const answer = await askConcierge(text, history);
      finish({ text: answer.text, booking: answer.booking ?? undefined });
    } catch (err) {
      console.error("askConcierge failed:", err);
      finish({ text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const navbar = (
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
  );

  const tabs = (
    <div role="tablist" className="flex justify-center gap-2 px-4 pt-32">
      {(
        [
          ["releases", "Releases"],
          ["concierge", "Movie Concierge"],
        ] as [Tab, string][]
      ).map(([key, label]) => (
        <button
          key={key}
          role="tab"
          aria-selected={tab === key}
          onClick={() => setTab(key)}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-semibold transition",
            tab === key ? "bg-emerald-500 text-black" : "border border-white/15 text-neutral-300 hover:border-white/40 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  if (tab === "releases") {
    return (
      <div className="min-h-screen bg-[#18181B] text-white antialiased">
        {navbar}
        {tabs}
        <h1 className="px-4 pt-10 text-center text-4xl font-semibold">Now in theatres</h1>
        {failed ? (
          <p className="py-7 text-center text-neutral-400">Couldn&apos;t load movies.</p>
        ) : (
          <div className="py-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7">
            {loading ? <MovieGridSkeleton /> : movies.map((movie) => <MovieCard key={movie.id} movie={movie} showBook />)}
          </div>
        )}
      </div>
    );
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#18181B] text-white antialiased">
      {navbar}
      {tabs}

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-40 pt-10">
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              Movie Concierge agent
            </h1>
            <p className="mt-4 max-w-md text-base text-neutral-400 md:text-lg">
              Say what you feel like watching and when. It picks the movie, venue, time and seats, and books them.
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

      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#18181B] via-[#18181B]/95 to-transparent px-4 pb-6 pt-10">
        <div className="mx-auto w-full max-w-5xl">
          <Composer onSend={send} disabled={busy} placeholder="Tell me what to book. Genre, time, venue, seats." />
        </div>
      </div>
    </div>
  );
}
