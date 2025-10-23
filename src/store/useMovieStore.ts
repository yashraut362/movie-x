import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Movie = {
  id: string;
  title: string;
  overview: string;
  poster: string;
  releaseYear: number;
  tags: string[];
};

type MovieStore = {
  movies: Movie[];
  getMovieById: (id: string) => Movie | undefined;
  addMovie: (movie: Movie) => void;
  setMovies: (movies: Movie[]) => void;
  removeMovie: (id: string) => void;
  resetStore: () => void;
};

const INITIAL_MOVIES: Movie[] = [
  {
    id: 'sample-1',
    title: 'The Sample Awakens',
    overview:
      'A lighthearted space adventure that showcases how to read data from the movie store without touching any external APIs.',
    poster: 'https://via.placeholder.com/500x750.png?text=Sample+1',
    releaseYear: 2024,
    tags: ['Adventure', 'Sci-Fi', 'Family'],
  },
  {
    id: 'sample-2',
    title: 'Codex & The Movie Buffs',
    overview:
      'A crew of developers set out to build the ultimate movie dashboard using simple Zustand state and a sprinkle of Tailwind.',
    poster: 'https://via.placeholder.com/500x750.png?text=Sample+2',
    releaseYear: 2023,
    tags: ['Comedy', 'Documentary'],
  },
];

const cloneInitialMovies = () =>
  INITIAL_MOVIES.map((movie) => ({
    ...movie,
    tags: [...movie.tags],
  }));

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => window.localStorage)
    : undefined;

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      movies: cloneInitialMovies(),
      getMovieById: (id: string) => get().movies.find((movie) => movie.id === id),
      addMovie: (movie: Movie) =>
        set((state) => {
          const exists = state.movies.some((item) => item.id === movie.id);

          if (exists) {
            return {
              movies: state.movies.map((item) =>
                item.id === movie.id ? movie : item
              ),
            };
          }

          return { movies: [...state.movies, movie] };
        }),
      setMovies: (movies: Movie[]) => set({ movies }),
      removeMovie: (id: string) =>
        set((state) => ({
          movies: state.movies.filter((movie) => movie.id !== id),
        })),
      resetStore: () => set({ movies: cloneInitialMovies() }),
    }),
    {
      name: 'movie-x-store',
      storage,
      partialize: (state) => ({ movies: state.movies }),
    }
  )
);
