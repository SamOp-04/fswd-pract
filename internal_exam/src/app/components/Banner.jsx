import React from 'react';
export default function Banner({ movie, onPlay }) {
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE;
  if (!movie) return null;
  return (
    <header
      className="relative h-[60vh] md:h-[70vh] flex items-end text-white p-8"
      style={{
        backgroundSize: 'cover',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85)), url(${imageBase + (movie.backdrop_path || movie.poster_path)})`,
      }}
    >
      <div className="max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold">
          {movie.title || movie.name}
        </h1>
        <p className="mt-4 text-sm md:text-lg line-clamp-3">{movie.overview}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onPlay(movie)}
            className="bg-white text-black px-4 py-2 rounded"
          >
            Play
          </button>
          <button className="bg-white/10 border border-white/20 px-4 py-2 rounded">
            More Info
          </button>
        </div>
      </div>
    </header>
  );
}
