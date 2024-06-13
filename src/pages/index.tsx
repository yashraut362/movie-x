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
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar";

import Footer from "@/components/ui/footer";
import axios from "axios";
import router from "next/router";
export default function Home() {
  const words = ["Movies", "Tv shows", 'Podcasts', 'Stand-up comedy'];
  const [active, setActive] = useState<string | null>(null);
  const [movies, setMovies] = useState([] as any)

  useEffect(() => {
    getmovies()
  }, []);

  const getmovies = async () => {
    const result = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_MOVIE_DB}`)
    setMovies(result.data.results)
  }
  return (
    <>
      <div className="relative w-full flex items-center justify-center">
        <div
          className={cn("fixed top-10  inset-x-0 max-w-2xl mx-auto z-50 top-2")}
        >
          <Menu setActive={setActive}>
            <div onClick={() => router.push(`/`)} >
              <MenuItem setActive={setActive} active={null} item="Home">

              </MenuItem>
            </div>
            <div onClick={() => router.push(`/explore`)} >
              <MenuItem setActive={setActive} active={null} item="Explore">

              </MenuItem>
            </div>
            <div onClick={() => window.open('https://yashraut.me')} >
              <MenuItem setActive={setActive} active={null} item="About">

              </MenuItem>
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
            Unleash the Magic of  <FlipWords words={words} />
          </div>
          <div className="font-extralight text-base md:text-4xl text-neutral-200 py-4">
            Stream Your Favorites Anytime, Anywhere
          </div>
          {/* <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
      Debug now
    </button> */}
        </motion.div>
      </AuroraBackground>
      <div className=" bg-[#18181B]">
        <span className="text-white text-4xl font-semibold ">Explore some movies from here</span>
        <div className="py-7  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7">
          {movies.map((movie: any) => (
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
                    target="__blank"
                    className="px-4 py-2 rounded-xl text-xs font-normal text-white"
                  >
                    Popularity: {movie.popularity}
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as={Link}
                    href={movie.id.toString()}
                    className="px-4 py-2 rounded-xl  bg-white text-black  text-xs font-bold"
                  >
                    Check details
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}

        </div>
      </div>
      <Footer />
    </>

  );
}
