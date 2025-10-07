import React from 'react';
export default function Modal({ open, onClose, videoKey, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg overflow-hidden max-w-3xl w-full">
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white text-lg hover:text-red-500"
          >
            ✕
          </button>
        </div>
        <div className="aspect-video bg-black">
          {videoKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1&rel=0`}
              title="Trailer"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              🎬 Trailer not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}