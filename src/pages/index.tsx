"use client";
import Image from "next/image";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AuroraBackground } from "../components/ui/hero-background";
import { FlipWords } from "@/components/ui/file-words";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/utils/cn";
import Link from "next/link";
import { Menu, MenuItem } from "@/components/ui/navbar";
import { PlaceholdersAndVanishInput } from "@/components/ui/input-placeholder";

import Footer from "@/components/ui/footer";
import { getPopular, searchMovies } from "@/lib/api";
import { MovieGridSkeleton } from "@/components/ui/movie-card-skeleton";
import router from "next/router";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

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
              <CardContainer className="inter-var" key={movie.id}>
                <CardBody className="relative group/card hover:shadow-2xlhover:shadow-emerald-500/[0.1] bg-black bg-opacity-45 border-white/[0.1]  w-auto sm:w-[20rem] h-auto rounded-xl p-6 border">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold line-clamp-1 text-neutral-600 text-white"
                  >
                    {movie.title}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm line-clamp-2 mt-2 text-neutral-300"
                  >
                    {movie.overview}
                  </CardItem>
                  <CardItem translateZ="100" className="w-full mt-4">
                    <Image
                      src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`}
                      height="1000"
                      width="1000"
                      className="h-80 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                      alt="thumbnail"
                    />
                  </CardItem>
                  <div className="flex justify-between items-center mt-20">
                    <CardItem
                      translateZ={20}
                      className="text-xs text-neutral-300"
                    >
                      <span className="text-yellow-400">★</span>{" "}
                      {movie.vote_average ? movie.vote_average.toFixed(1) : "–"}
                      {movie.release_date && (
                        <span className="text-neutral-500">
                          {" "}
                          · {movie.release_date.slice(0, 4)}
                        </span>
                      )}
                    </CardItem>
                    <div className="flex gap-2 [transform-style:preserve-3d]">
                      <CardItem
                        translateZ={20}
                        as={Link}
                        href={`/${movie.id}`}
                        className="px-4 py-2 rounded-xl border border-white/30 text-white text-xs font-bold"
                      >
                        Details
                      </CardItem>
                      <CardItem
                        translateZ={20}
                        as={Link}
                        href={`/book/${movie.id}`}
                        className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
                      >
                        Book
                      </CardItem>
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
