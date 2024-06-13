'use client'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'
import { PacmanLoader } from 'react-spinners';
const Plyr = dynamic(() => import('plyr-react'), { ssr: false })

import "plyr-react/plyr.css"
const MoviePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState<any>(null);
    const [trailerId, setTrailerId] = useState<any>(null);
    const [duration, setduration] = useState<any>(null)

    const fetchMovieById = async (id: string) => {
        try {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_MOVIE_DB}`);
            setMovie(response.data)
            const hours = Math.floor(response.data.runtime / 60);
            const minutes = response.data.runtime % 60;
            const formattedTime = `${hours} hours and ${minutes} minutes`;
            setduration(formattedTime)
            // Fetch movie videos
            const videosResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_MOVIE_DB}&language=en-US`);

            const trailerAndYouTubeVideos = videosResponse.data.results.filter((video: any) => {
                console.log(video)
                // Check if the video is a trailer or hosted on YouTube
                return video.name.includes('Trailer') || video.type === "Trailer" && video.site.toLowerCase() === "youtube";
            });

            trailerAndYouTubeVideos[0].key ? setTrailerId(trailerAndYouTubeVideos[0].key) : setTrailerId(videosResponse.data.results[0].key)
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    };
    useEffect(() => {
        fetchMovieById(String(id))
    }, [id]);

    if (!movie) {
        return <div className='w-screen h-screen flex items-center justify-center'>
            <PacmanLoader color="#36d7b7" />
        </div>;
    }

    return (
        <div className='w-screen h-screen overflow-y-hidden'
            style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0), rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url('https://image.tmdb.org/t/p/original/${movie.backdrop_path}')`,
                backgroundPosition: "top",
                backgroundSize: "cover"
            }}
        >
            <div className='flex flex-col md:flex-row items-center justify-center p-10 h-[120vh]'>
                <div className="w-full md:w-1/2 mb-10 lg:mb-0 ">
                    <Plyr
                        id={trailerId}
                        options={{ resetOnEnd: true }}
                        source={{
                            type: "video",
                            // @ts-ignore
                            sources: [{ src: `https://www.youtube.com/watch?v=${trailerId}`, provider: 'youtube' }],
                        }}
                    />
                </div>
                <div className="w-full md:w-1/2 lg:pl-16">
                    <h1 className="text-4xl font-bold mb-4">{movie?.title}</h1>
                    <p className="text-lg mb-6">{movie.overview}</p>
                    <div className="flex flex-wrap mb-4">
                        <div className="mr-4 mb-2">
                            <span className="text-sm font-semibold">Status:</span>
                            <span className="ml-2">{movie.status}</span>
                        </div>
                        <div className="mr-4 mb-2">
                            <span className="text-sm font-semibold">Release Date:</span>
                            <span className="ml-2">
                                {new Date(movie.release_date).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}</span>
                        </div>
                        <div className="mr-4 mb-2">
                            <span className="text-sm font-semibold">Rating:</span>
                            <span className="ml-2">{Math.floor(movie.vote_average * 100) / 100} / 10</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap mb-4">
                        <span className="text-sm font-semibold mr-2">Genre:</span>
                        {movie.genres.map((genre: any) => (
                            <span key={genre.id} className="mr-2 mb-2 py-1 px-3 bg-[#181818] rounded-full text-sm">{genre.name}</span>
                        ))}
                    </div>
                    <p className="text-sm font-semibold">Duration: {duration}</p>
                </div>
            </div>
        </div>
    );
};

export default MoviePage;


