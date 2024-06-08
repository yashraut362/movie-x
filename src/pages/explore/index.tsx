"use client";
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { PlaceholdersAndVanishInput } from '@/components/ui/input-placeholder';
import axios from 'axios';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { debounce } from 'lodash';

interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    popularity: number;
}

export default function Explore() {
    const [query, setQuery] = useState<string>('');
    const [movies, setMovies] = useState<Movie[]>([]);

    const placeholders = [
        "Search for a movie that you always wanted to watch",
        "Search for a movie with your favorite actor",
        "Search for a movie with your favorite director",
        "Search for a movie with your favorite genre",
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
    useEffect(() => {
        debouncedSearch();
        return () => {
            debouncedSearch.cancel(); // Cancel any pending debounce calls on component unmount
        };
    }, [query]);

    return (
        <>
            <div className="h-[20rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
                <div className="max-w-2xl mx-auto p-4">
                    <h1 className="relative z-10 pb-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
                        Explore and Discover Movies
                    </h1>
                    <p></p>

                    <PlaceholdersAndVanishInput
                        placeholders={placeholders}
                        onChange={handleInputChange}
                        onSubmit={handleSearch} />
                </div>
                <BackgroundBeams />
            </div>
            <form onSubmit={handleSearch} className="py-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7">
                {movies.map((movie: Movie) => (
                    <CardContainer className="inter-var" key={movie.id}>
                        <CardBody className="relative group/card hover:shadow-2xl hover:shadow-emerald-500/[0.1] bg-black bg-opacity-45 border-white/[0.1] w-auto sm:w-[20rem] h-auto rounded-xl p-6 border">
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
                                    height={1000}
                                    width={1000}
                                    className="h-80 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                                    alt="thumbnail" />
                            </CardItem>
                            <div className="flex justify-between items-center mt-20">
                                <CardItem
                                    translateZ={20}
                                    target="__blank"
                                    className="px-4 py-2 rounded-xl text-xs font-normal text-white"
                                >
                                    Popularity: {movie.popularity}
                                </CardItem>
                                <CardItem
                                    translateZ={20}
                                    as={Link}
                                    href={`/${movie.id}`} // Adjusted URL to match a typical dynamic route in Next.js
                                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
                                >
                                    Check details
                                </CardItem>
                            </div>
                        </CardBody>
                    </CardContainer>
                ))}
            </form>
        </>
    );
}
