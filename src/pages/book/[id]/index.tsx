"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Menu, MenuItem } from "@/components/ui/navbar";
import axios from "axios";
import { createBooking, getMovie, getShows, getTakenSeats, type Shows } from "@/lib/api";
import { cn } from "@/utils/cn";

type Movie = { title: string; poster_path: string | null };

export default function BookMovie() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<number | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Shows | null>(null);
  const [failed, setFailed] = useState(false);

  const [venue, setVenue] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Hide the toast a few seconds after it appears.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Seats already booked for the chosen show. Re-run after every booking attempt.
  const loadTaken = async () => {
    if (movieId === null || !shows || !venue || !time) return;
    setSeatsLoading(true);
    try {
      const { seats: booked } = await getTakenSeats({ tmdbId: movieId, venue, date: shows.date, time });
      setTaken(booked);
      setSeats((prev) => prev.filter((s) => !booked.includes(s)));
    } catch (error) {
      console.error("Error fetching taken seats:", error);
      setToast("Couldn't load booked seats.");
    } finally {
      setSeatsLoading(false);
    }
  };

  useEffect(() => {
    setTaken([]);
    loadTaken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, shows, venue, time]);

  const book = async () => {
    if (!movie || !shows || movieId === null || !venue || !time) return;
    setBooking(true);
    try {
      await createBooking({ tmdbId: movieId, venue, date: shows.date, time, seats });
      setToast(`Booked ${movie.title} at ${venue}, ${time}, seats ${seats.join(", ")}.`);
      setSeats([]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const conflict: string[] = error.response.data?.seats ?? [];
        setToast(`Seats ${conflict.join(", ")} were just taken.`);
        setSeats((prev) => prev.filter((s) => !conflict.includes(s)));
      } else {
        console.error("Error booking:", error);
        setToast("Booking failed.");
      }
    } finally {
      setBooking(false);
      loadTaken();
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    if (!id) return;
    setMovieId(Number(id));
    Promise.all([getMovie(id), getShows()])
      .then(([movieData, showsData]) => {
        setMovie(movieData);
        setShows(showsData);
      })
      .catch((error) => {
        console.error("Error fetching movie or shows:", error);
        setFailed(true);
      });
  }, [router.isReady, router.query.id]);

  const toggleSeat = (seat: string) => {
    if (taken.includes(seat)) return;
    setSeats((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
  };

  const canBook = venue !== null && time !== null && seats.length > 0 && !seatsLoading && !booking;

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

  let body: React.ReactNode;

  if (failed) {
    body = <p className="text-neutral-400">Couldn&apos;t load this movie.</p>;
  } else if (!movie || !shows) {
    body = <p className="text-neutral-400">Loading…</p>;
  } else {
    body = (
      <>
        <div className="flex items-center justify-center gap-6">
          {movie.poster_path && (
            <Image
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
              width={120}
              height={180}
              alt={movie.title}
              className="rounded-lg"
            />
          )}
          <h1 className="text-3xl md:text-5xl font-bold">{movie.title}</h1>
        </div>

        <section className="text-center">
          <h2 className="text-lg font-semibold mb-3">Venue</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {shows.venues.map((v) => (
              <button
                key={v}
                onClick={() => setVenue(v)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm",
                  venue === v ? "bg-emerald-500 text-black border-emerald-500" : "border-white/20 hover:border-white/50"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-lg font-semibold mb-3">Showtime</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {shows.showtimes.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm",
                  time === t ? "bg-emerald-500 text-black border-emerald-500" : "border-white/20 hover:border-white/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold mb-3">Seats</h2>
          <div className="inline-flex flex-col gap-2">
            {shows.rows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-4 text-xs text-neutral-500">{row}</span>
                {Array.from({ length: shows.seatsPerRow }, (_, i) => {
                  const seat = `${row}${i + 1}`;
                  const isTaken = taken.includes(seat);
                  const selected = seats.includes(seat);
                  return (
                    <button
                      key={seat}
                      onClick={() => toggleSeat(seat)}
                      disabled={isTaken || seatsLoading}
                      title={seat}
                      className={cn(
                        "h-8 w-8 rounded text-xs",
                        isTaken && "bg-neutral-700 cursor-not-allowed",
                        !isTaken && selected && "bg-emerald-500 text-black",
                        !isTaken && !selected && "bg-neutral-900 border border-white/20 hover:border-white/50"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-neutral-400">
            {seatsLoading
              ? "Loading seats…"
              : seats.length === 0
                ? "Pick your seats."
                : `Selected: ${seats.join(", ")}`}
          </p>
        </section>

        <button
          onClick={book}
          disabled={!canBook}
          className={cn(
            "self-center px-6 py-3 rounded-xl font-bold",
            canBook ? "bg-emerald-500 text-black" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
          )}
        >
          Book
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white antialiased">
      {navbar}
      <button
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur hover:bg-black/80"
      >
        <span aria-hidden>&larr;</span> Back
      </button>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-32 pb-16">{body}</main>
      {toast && (
        <div
          role="status"
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-neutral-900 px-5 py-3 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
