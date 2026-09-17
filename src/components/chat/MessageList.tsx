"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMovie } from "@/lib/api";
import { motion } from "framer-motion";
import type { Pick } from "@/lib/askMovieX";
import { cn } from "@/utils/cn";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  picks?: Pick[];
  streaming?: boolean;
};

type MovieMeta = {
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

function MovieCard({ pick, index }: { pick: Pick; index: number }) {
  const [meta, setMeta] = useState<MovieMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMovie(pick.tmdbId)
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch((err) => console.error("Error fetching pick:", err));
    return () => {
      cancelled = true;
    };
  }, [pick.tmdbId]);

  const year = meta?.release_date ? meta.release_date.slice(0, 4) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      <Link
        href={`/${pick.tmdbId}`}
        className="group flex h-full flex-col rounded-[20px] border border-white/10 bg-[#1F2121] p-4 transition duration-200 hover:border-emerald-500/60 hover:bg-[#232525]"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-black/40">
          {meta?.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${meta.poster_path}`}
              alt={meta.title}
              fill
              sizes="(max-width: 640px) 50vw, 260px"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-white/5" />
          )}
        </div>
        <div className="mt-3 flex-1">
          <p className="line-clamp-1 text-base font-semibold text-white">
            {meta?.title ?? "Loading…"}
          </p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">
            {pick.why}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {year ? (
            <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {year}
            </span>
          ) : (
            <span />
          )}
          {meta ? (
            <span className="font-mono text-[11px] text-white/60">
              {Math.round(meta.vote_average * 10) / 10}
            </span>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-[20px] px-4 py-3 text-[15px] leading-relaxed sm:max-w-[640px]",
          isUser
            ? "rounded-br-md bg-emerald-500 text-black"
            : "rounded-bl-md border border-white/10 bg-[#1F2121] text-neutral-100"
        )}
      >
        {message.text}
        {message.streaming ? (
          <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-emerald-300" />
        ) : null}
      </div>
    </div>
  );
}

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-5">
      {messages.map((m) => (
        <div key={m.id} className="flex flex-col gap-3">
          <Bubble message={m} />
          {m.picks && m.picks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {m.picks.map((p, i) => (
                <MovieCard key={p.tmdbId} pick={p} index={i} />
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
