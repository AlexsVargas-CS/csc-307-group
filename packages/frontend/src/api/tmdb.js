const API_BASE = "http://localhost:3001/api/tmdb";

export function posterURL(path, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function searchFilms(query, type = "movie") {
  const params = new URLSearchParams({ query, type });
  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getFilmDetails(type, tmdbId) {
  const res = await fetch(`${API_BASE}/${type}/${tmdbId}`);
  if (!res.ok) throw new Error("Failed to load details");
  return res.json();
}
