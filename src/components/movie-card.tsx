import Image from "next/image";
import Link from "next/link";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

// 3D movie card used by the home and book grids. `showBook` adds the Book
// button; only movies now in theatres get it.
export function MovieCard({ movie, showBook = false }: { movie: Movie; showBook?: boolean }) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="relative group/card hover:shadow-2xlhover:shadow-emerald-500/[0.1] bg-black bg-opacity-45 border-white/[0.1]  w-auto sm:w-[20rem] h-auto rounded-xl p-6 border">
        <CardItem translateZ="50" className="text-xl font-bold line-clamp-1 text-neutral-600 text-white">
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
          <CardItem translateZ={20} className="text-xs text-neutral-300">
            <span className="text-yellow-400">★</span> {movie.vote_average ? movie.vote_average.toFixed(1) : "–"}
            {movie.release_date && (
              <span className="text-neutral-500"> · {movie.release_date.slice(0, 4)}</span>
            )}
          </CardItem>
          {/* preserve-3d keeps the tilted links clickable; a flat wrapper breaks hit-testing. */}
          <div className="flex gap-2 [transform-style:preserve-3d]">
            <CardItem
              translateZ={20}
              as={Link}
              href={`/${movie.id}`}
              className="px-4 py-2 rounded-xl border border-white/30 text-white text-xs font-bold"
            >
              Details
            </CardItem>
            {showBook && (
              <CardItem
                translateZ={20}
                as={Link}
                href={`/book/${movie.id}`}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
              >
                Book
              </CardItem>
            )}
          </div>
        </div>
      </CardBody>
    </CardContainer>
  );
}
