import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const api = axios.create({ baseURL: API_URL });

export const getPopular = () => api.get("/api/movies/popular").then((r) => r.data);
export const searchMovies = (q: string) => api.get("/api/movies/search", { params: { q } }).then((r) => r.data);
export const getMovie = (id: string | number) => api.get(`/api/movies/${id}`).then((r) => r.data);
export const getVideos = (id: string | number) => api.get(`/api/movies/${id}/videos`).then((r) => r.data);
export const getNowPlaying = () => api.get("/api/movies/now-playing").then((r) => r.data);

// Venues, showtimes and seat layout for the booking simulation, plus today's date.
export type Shows = { venues: string[]; showtimes: string[]; rows: string[]; seatsPerRow: number; date: string };
export const getShows = () => api.get("/api/shows").then((r) => r.data as Shows);

export type ShowKey = { tmdbId: number; venue: string; date: string; time: string };
export const getTakenSeats = (key: ShowKey) =>
  api.get("/api/bookings/taken", { params: key }).then((r) => r.data as { seats: string[] });
export const createBooking = (body: ShowKey & { seats: string[] }) =>
  api.post("/api/bookings", body).then((r) => r.data);

// Booking concierge chat. Returns the reply text; the backend runs the tools.
export type ConciergeTurn = { role: "user" | "assistant"; text: string };
export const askConcierge = (message: string, history: ConciergeTurn[] = []) =>
  api.post("/api/concierge", { message, history }).then((r) => r.data as { text: string });
