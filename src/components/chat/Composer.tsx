"use client";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/utils/cn";

const MAX_LINES = 6;
const LINE_HEIGHT = 24;

export default function Composer({
  onSend,
  disabled,
  placeholder = "Ask for a movie. Mood, genre, actor, anything.",
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_LINES * LINE_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="rounded-[20px] border border-white/10 bg-[#1F2121] p-2 shadow-2xl shadow-black/40 transition focus-within:border-emerald-500/60">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="max-h-[144px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-6 text-white placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            "mb-1 mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition",
            canSend
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-white/10 text-neutral-500"
          )}
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
      <p className="px-3 pb-1 text-[11px] text-neutral-500">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}
