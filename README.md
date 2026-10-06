# movie-x

A Next.js frontend for browsing movies, asking for recommendations, and booking seats. Catalog data, the recommendation model, and bookings live in a separate Express API, [movie-x-backend](https://github.com/yashraut362/movie-x-backend), so the TMDB key never reaches the browser.

## Features

- **Home** (`/`) — popular movies, with search that waits briefly after the last keystroke.
- **Movie** (`/[id]`) — details and a YouTube trailer.
- **Ask** (`/ask`) — recommendation chat. The question is embedded, matched against movie vectors in Pinecone, and the model can only recommend films it retrieved.
- **Book** (`/book`) — now-playing releases, plus a movie concierge that picks a show and books seats from a message. Seat maps at `/book/[id]` persist on the backend and reject seats that were just taken.

## Getting started

Node 18+. Clone [movie-x-backend](https://github.com/yashraut362/movie-x-backend) next to this repo and start it first:

```bash
# in ../movie-x-backend
npm install && cp .env.example .env   # fill in TMDB_API_KEY and the model keys
npm run dev                            # http://localhost:4000
```

Then this app:

```bash
npm install
npm run dev                            # http://localhost:3000
```

Point the frontend at the API with `NEXT_PUBLIC_API_URL` in `.env.local`. It defaults to `http://localhost:4000`.

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
