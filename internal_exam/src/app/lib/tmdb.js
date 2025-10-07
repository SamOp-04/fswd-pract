export async function fetchTMDB(endpoint) {
  const base = process.env.NEXT_PUBLIC_TMDB_BASE;
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const res = await fetch(`${base}${endpoint}?api_key=${apiKey}&language=en-US`);
  if (!res.ok) throw new Error("Failed to fetch TMDB data");
  return res.json();
}