"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Menu, MenuItem } from "@/components/ui/navbar";
import { MovieCard, type Movie } from "@/components/movie-card";
import { MovieGridSkeleton } from "@/components/ui/movie-card-skeleton";
import { getNowPlaying } from "@/lib/api";
import { cn } from "@/utils/cn";

export default function Book() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getNowPlaying()
      .then((data) => setMovies(data.results))
      .catch((error) => {
        console.error("Error fetching now playing:", error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#18181B] text-white antialiased">
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
      <h1 className="px-4 pt-32 text-center text-4xl font-semibold">Now in theatres</h1>
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
