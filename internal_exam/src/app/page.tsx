'use client';
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import Modal from './components/Modal';
import { fetchTMDB } from './lib/tmdb';
export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [bannerItem, setBannerItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  useEffect(() => {
    async function load() {
      try {
        const t = await fetchTMDB('/trending/all/week');
        setTrending(t.results || []);
        const p = await fetchTMDB('/movie/popular');
        setPopular(p.results || []);
        const r = await fetchTMDB('/movie/top_rated');
        setTopRated(r.results || []);
        const choose =
          (p.results && p.results[Math.floor(Math.random() * p.results.length)]) ||
          (t.results && t.results[0]);
        setBannerItem(choose);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);
  async function handleItemClick(item: { title: any; name: any; media_type: string; first_air_date: any; id: any; }) {
    try {
      setModalOpen(true);
      setVideoKey(null);
      setSelectedTitle(item.title || item.name);
      const type = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie';
      const data = await fetchTMDB(`/${type}/${item.id}/videos`);
      const trailer = (data.results || []).find(
        (v: { site: string; type: string; }) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      setVideoKey(trailer?.key || null);
    } catch (e) {
      console.error(e);
      setVideoKey(null);
    }
  }
  return (
    <div className="bg-[#04121e] min-h-screen text-white">
      <Navbar />
      <main className="pt-16">
        <Banner movie={bannerItem} onPlay={handleItemClick} />
        <div className="max-w-7xl mx-auto">
          <Row title="Trending" items={trending} onItemClick={handleItemClick} />
          <Row title="Popular Movies" items={popular} onItemClick={handleItemClick} />
          <Row title="Top Rated" items={topRated} onItemClick={handleItemClick} />
        </div>
      </main>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        videoKey={videoKey}
        title={selectedTitle}
      />
    </div>
  );
}