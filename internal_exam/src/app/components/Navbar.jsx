import React from 'react';
import Image from 'next/image';
export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Image src="/logo.png" alt="Logo" width={120} height={40} />
        <div className="flex items-center gap-4">
          <input
            className="hidden sm:block bg-white/10 text-white placeholder:text-white/60 rounded px-3 py-1 focus:outline-none"
            placeholder="Search..."
          />
          <div className="text-white/80 cursor-pointer">Sign in</div>
        </div>
      </div>
    </nav>
  );
}