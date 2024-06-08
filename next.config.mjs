/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      { hostname: "assets.aceternity.com" },
      { hostname: "movieposters2.com" },
      { hostname: "m.media-amazon.com" },
      { hostname: "image.tmdb.org" },
    ],
  },
};

export default nextConfig;
