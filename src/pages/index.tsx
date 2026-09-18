"use client";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AuroraBackground } from "../components/ui/hero-background";
import { FlipWords } from "@/components/ui/file-words";
import { MovieCard, type Movie } from "@/components/movie-card";
const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/utils/cn";
import { Menu, MenuItem } from "@/components/ui/navbar";
import { PlaceholdersAndVanishInput } from "@/components/ui/input-placeholder";

import Footer from "@/components/ui/footer";
import { getPopular, searchMovies } from "@/lib/api";
import { MovieGridSkeleton } from "@/components/ui/movie-card-skeleton";
import router from "next/router";

const placeholders = [
  "Search for a movie that you always wanted to watch",
  "Search for a movie with your favorite actor",
  "Search for a movie with your favorite director",
  "Search for a movie with your favorite genre",
];

// Last result, kept across client-side navigations so coming back from a
// movie page renders the same grid immediately and the scroll position holds.
let lastResult: { query: string; movies: Movie[] } | null = null;

export default function Home() {
  const words = ["Movies", "Tv shows", "Podcasts", "Stand-up comedy"];
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState(lastResult?.query ?? "");
  const [movies, setMovies] = useState<Movie[]>(lastResult?.movies ?? []);
  const [loading, setLoading] = useState(lastResult === null);

  // Popular movies by default; search results once the user types. Waits 500ms after the last keystroke.
  useEffect(() => {
    if (lastResult && lastResult.query === query) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = query.trim()
          ? await searchMovies(query)
          : await getPopular();
        setMovies(data.results);
        lastResult = { query, movies: data.results };
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    if (!query.trim()) {
      load();
      return;
    }
    const timer = setTimeout(load, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <div className="relative w-full flex items-center justify-center">
        <div
          className={cn("fixed top-10  inset-x-0 max-w-2xl mx-auto z-50 top-2")}
        >
          <Menu setActive={setActive}>
            <div onClick={() => router.push(`/`)}>
              <MenuItem
                setActive={setActive}
                active={null}
                item="Home"
              ></MenuItem>
            </div>
            <div onClick={() => router.push(`/book`)}>
              <MenuItem
                setActive={setActive}
                active={null}
                item="Book"
              ></MenuItem>
            </div>
            <div onClick={() => router.push(`/ask`)}>
              <MenuItem
                setActive={setActive}
                active={null}
                item="Ask"
              ></MenuItem>
            </div>
            <div onClick={() => window.open("https://yashraut.me")}>
              <MenuItem
                setActive={setActive}
                active={null}
                item="About"
              ></MenuItem>
            </div>
          </Menu>
        </div>
      </div>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold text-white text-center">
            Unleash the Magic of <FlipWords words={words} />
          </div>
          <div className="font-extralight text-base md:text-4xl text-neutral-200 py-4">
            Stream Your Favorites Anytime, Anywhere
          </div>
        </motion.div>
      </AuroraBackground>
      <div className=" bg-[#18181B]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-around gap-6 px-4 pt-12">
          <span className="text-white text-4xl font-semibold">
            Explore some movies from here
          </span>
          <div className="w-full md:max-w-xl">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              defaultValue={query}
              onChange={(e) => setQuery(e.target.value)}
              onSubmit={(e) => e.preventDefault()}
            />
          </div>
        </div>
        <div className="py-7  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7">
          {loading ? (
            <MovieGridSkeleton />
          ) : (
            movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
