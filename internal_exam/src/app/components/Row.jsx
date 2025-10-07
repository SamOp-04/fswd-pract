import React from 'react';
export default function Row({ title, items, onItemClick }) {
  const imageBase = process.env.NEXT_PUBLIC_TMDB_IMAGE;
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[200px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onItemClick(item)}
          >
            <img
              src={imageBase + item.poster_path}
              alt={item.title || item.name}
              className="rounded-lg"
            />
            <p className="mt-2 text-sm truncate">{item.title || item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}