/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Restore scroll position when navigating back/forward (pages router).
  experimental: { scrollRestoration: true },
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      { hostname: "assets.aceternity.com" },
      { hostname: "movieposters2.com" },
      { hostname: "m.media-amazon.com" },
      { hostname: "image.tmdb.org" },
      { hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
