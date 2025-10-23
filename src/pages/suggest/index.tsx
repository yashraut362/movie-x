"use client";
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { PlaceholdersAndVanishInput } from '@/components/ui/input-placeholder';
import axios from 'axios';
import React, { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { debounce } from 'lodash';
import { CometCard } from '@/components/ui/comet-card';
import { useMovieStore } from '@/store/useMovieStore';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  popularity: number;
  release_date?: string;
  genre_ids?: number[];
}

export default function Suggest() {
  const [query, setQuery] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const addMovie = useMovieStore((state) => state.addMovie);
  const savedMovies = useMovieStore((state) => state.movies);
  const removeMovie = useMovieStore((state) => state.removeMovie);

  const savedMovieIds = useMemo(() => {
    return new Set(savedMovies.map((movie) => movie.id));
  }, [savedMovies]);
  const featuredSuggestions = useMemo(
    () => savedMovies.slice(0, 5),
    [savedMovies]
  );
  const emptySlots = Math.max(0, 5 - featuredSuggestions.length);
  const hasReachedLimit = savedMovies.length >= 5;

  const placeholders = [
    'Search for a movie that you always wanted to watch',
    'Search for a movie with your favorite actor',
    'Search for a movie with your favorite director',
    'Search for a movie with your favorite genre',
  ];

  const handleSearch = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const apiKey = process.env.NEXT_PUBLIC_MOVIE_DB;
    let url: string;
    if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
    }
    try {
      const response = await axios.get(url);
      setMovies(response.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const debouncedSearch = debounce(handleSearch, 500);

  const handleAddToStore = (movie: Movie) => {
    const movieId = movie.id.toString();
    if (savedMovieIds.has(movieId) || savedMovies.length >= 5) {
      return;
    }
    const releaseYear = movie.release_date
      ? Number.parseInt(movie.release_date.slice(0, 4), 10)
      : 0;

    addMovie({
      id: movieId,
      title: movie.title,
      overview: movie.overview || 'No overview available.',
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/original/${movie.poster_path}`
        : 'https://via.placeholder.com/500x750.png?text=No+Poster',
      releaseYear: Number.isNaN(releaseYear) ? 0 : releaseYear,
      tags: movie.genre_ids?.map((genreId) => `Genre ${genreId}`) ?? ['Suggested'],
    });
  };

  useEffect(() => {
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/90 p-6 pb-14 shadow-xl shadow-black/30 md:p-10">
        <BackgroundBeams />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="bg-gradient-to-b from-neutral-100 via-neutral-200 to-neutral-600 bg-clip-text text-3xl font-bold uppercase tracking-wide text-transparent md:text-6xl">
              Explore and Discover Movies
            </h1>
            <p className="mt-4 max-w-3xl text-sm text-neutral-300 md:text-base">
              Start typing to surface new favorites. The comet cards keep your saved picks in one place so you can revisit them quickly.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-neutral-500">
              Save up to 5 suggestions
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleInputChange}
              onSubmit={handleSearch}
            />
          </div>

          <div className="flex w-full snap-x gap-4 overflow-x-auto pb-2 pt-4 md:grid md:grid-cols-5 md:gap-6 md:overflow-visible">
            {featuredSuggestions.map((movie) => {
              const posterSrc =
                movie.poster || 'https://via.placeholder.com/500x750.png?text=No+Poster';

              return (
                <CometCard
                  key={movie.id}
                  className="min-w-[15rem] snap-center md:min-w-0"
                >
                  <div
                    className="group relative my-4 flex h-full w-full cursor-pointer flex-col items-stretch rounded-[20px] border border-white/10 bg-[#1F2121] p-4 transition duration-200 hover:border-emerald-500/60 hover:bg-[#232525]"
                    aria-label={`Saved suggestion for ${movie.title}`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: 'none',
                    }}
                  >
                    <div className="mx-1 flex-1">
                      <div className="relative mt-1 aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-white/5 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black">
                        <Image
                          src={posterSrc}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 768px) 60vw, 18vw"
                          className="object-cover transition duration-200 mix-blend-screen group-hover:opacity-90"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-shrink-0 items-center justify-between rounded-xl border border-white/5 bg-black/60 px-4 py-3 font-mono text-xs text-white/70 transition group-hover:border-emerald-500/70 group-hover:text-emerald-200">
                      <span className="line-clamp-2 text-left">
                        {movie.title}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeMovie(movie.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-500/70 bg-gradient-to-r from-red-500/15 via-red-500/10 to-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-red-200 transition hover:border-red-400 hover:from-red-500/25 hover:text-red-100"
                        aria-label={`Remove ${movie.title}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                        </svg>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </CometCard>
              );
            })}
            {Array.from({ length: emptySlots }, (_, index) => {
              const slotNumber = featuredSuggestions.length + index + 1;
              return (
                <CometCard
                  key={`placeholder-${index}`}
                  className="min-w-[15rem] snap-center md:min-w-0"
                >
                  <div
                    className="group my-4 flex h-full w-full cursor-pointer flex-col items-stretch rounded-[20px] border border-white/10 bg-[#1F2121] p-4 opacity-50"
                    aria-label={`Empty suggestion slot ${slotNumber}`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: 'none',
                    }}
                  >
                    <div className="mx-1 flex-1">
                      <div className="relative mt-1 aspect-[3/4] w-full overflow-hidden rounded-[18px] border border-dashed border-white/10 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
                    </div>
                    <div className="mt-4 flex flex-shrink-0 items-center justify-between rounded-xl border border-white/5 bg-black/60 px-4 py-3 font-mono text-xs text-white/40">
                      <span>Empty Slot</span>
                      <span>#{slotNumber}</span>
                    </div>
                  </div>
                </CometCard>
              );
            })}
          </div>
        </div>
      </section>
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 gap-y-7 py-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {movies.map((movie: Movie) => {
          const posterSrc = movie.poster_path
            ? `https://image.tmdb.org/t/p/original/${movie.poster_path}`
            : 'https://via.placeholder.com/500x750.png?text=No+Poster';
          const movieId = movie.id.toString();
          const isSaved = savedMovieIds.has(movieId);
          const savedIndex = isSaved
            ? savedMovies.findIndex((saved) => saved.id === movieId)
            : -1;
          const savedPosition = savedIndex >= 0 ? savedIndex + 1 : 1;
          const addButtonLabel = isSaved
            ? `Saved · #${savedPosition}`
            : hasReachedLimit
              ? 'Limit Reached'
              : 'Add to Suggest';
          const addButtonBaseClasses =
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition';
          const addButtonVariantClasses = isSaved
            ? 'cursor-not-allowed border-pink-500/70 bg-pink-500/20 text-pink-200'
            : hasReachedLimit
              ? 'cursor-not-allowed border-pink-300/60 bg-pink-500/15 text-pink-200/70'
              : 'border-pink-400/60 bg-gradient-to-r from-pink-500/15 via-pink-500/10 to-transparent text-pink-200 hover:border-pink-300 hover:from-pink-500/25 hover:text-pink-100';

          return (
            <CardContainer className="inter-var" key={movie.id}>
              <CardBody className="group/card relative h-auto w-auto rounded-xl border border-white/[0.1] bg-black bg-opacity-45 p-6 hover:shadow-2xl hover:shadow-emerald-500/[0.1] sm:w-[20rem]">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 line-clamp-1 text-white"
                >
                  {movie.title}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 mt-2 max-w-sm text-sm line-clamp-2 text-neutral-300"
                >
                  {movie.overview}
                </CardItem>
                <CardItem translateZ="100" className="mt-4 w-full">
                  <Image
                    src={posterSrc}
                    height={1000}
                    width={1000}
                    className="h-80 w-full rounded-xl object-cover group-hover/card:shadow-xl"
                    alt={`${movie.title} poster`}
                  />
                </CardItem>
                <div className="mt-20 flex flex-wrap items-center justify-between gap-3">
                  <CardItem
                    translateZ={20}
                    target="__blank"
                    className="text-xs font-normal text-white"
                  >
                    Popularity: {Math.min((movie.popularity / 1000) * 100, 100).toFixed(1)}%
                  </CardItem>
                
                  
                </div>
                <div className='flex flex-row items-center justify-evenly pt-5'>
                    <CardItem translateZ={20}>
                    <button
                      type="button"
                      onClick={() => handleAddToStore(movie)}
                      disabled={isSaved || hasReachedLimit}
                      aria-label={
                        isSaved
                          ? `${movie.title} already saved`
                          : hasReachedLimit
                            ? 'You have reached the maximum of 5 saved movies'
                            : `Add ${movie.title} to suggestions`
                      }
                      className={`${addButtonBaseClasses} ${addButtonVariantClasses}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        {isSaved ? (
                          <path d="m5.5 13.5 4 4 9-9" />
                        ) : hasReachedLimit ? (
                          <>
                            <path d="M6 6l12 12" />
                            <path d="M6 18L18 6" />
                          </>
                        ) : (
                          <>
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                          </>
                        )}
                      </svg>
                      <span>{addButtonLabel}</span>
                    </button>
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as={Link}
                    href={`/${movie.id}`}
                    aria-label={`View details for ${movie.title}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/60 bg-sky-500/10 text-sky-200 transition hover:border-sky-300 hover:bg-sky-500/25 hover:text-sky-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                    <span className="sr-only">Check details</span>
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          );
        })}
      </form>
    </>
  );
}
