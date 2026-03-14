const API_BASE = "/api/tmdb";

export function posterURL(
  path,
  size = "w500"
) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function searchFilms(
  query,
  type = "movie"
) {
  const params = new URLSearchParams({
    query,
    type
  });
  const res = await fetch(
    `${API_BASE}/search?${params}`
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getFilmDetails(
  type,
  tmdbId
) {
  const res = await fetch(
    `${API_BASE}/${type}/${tmdbId}`
  );
  if (!res.ok)
    throw new Error("Failed to load details");
  return res.json();
}

export async function getSimilarFilms(
  type,
  tmdbId
) {
  const res = await fetch(
    `${API_BASE}/${type}/${tmdbId}/similar`
  );
  if (!res.ok)
    throw new Error("Failed to load similar films");
  const data = await res.json();
  return data.results;
}

let genreCache = null;

export async function fetchGenres() {
  if (genreCache) return genreCache;
  const res = await fetch(`${API_BASE}/genres`);
  if (!res.ok)
    throw new Error("Failed to load genres");
  const data = await res.json();
  genreCache = new Map(
    data.genres.map((g) => [g.id, g.name])
  );
  return genreCache;
}

export async function fetchTrending(
  timeWindow = "week"
) {
  const res = await fetch(
    `${API_BASE}/trending/${timeWindow}`
  );
  if (!res.ok)
    throw new Error("Failed to load trending");
  const data = await res.json();
  return data.results;
}

export async function fetchNewReleases() {
  const res = await fetch(
    `${API_BASE}/now-playing`
  );
  if (!res.ok)
    throw new Error(
      "Failed to load new releases"
    );
  const data = await res.json();
  return data.results;
}

export async function fetchByGenre(genreId) {
  const res = await fetch(
    `${API_BASE}/discover?with_genres=${genreId}`
  );
  if (!res.ok)
    throw new Error(
      "Failed to load genre films"
    );
  const data = await res.json();
  return data.results;
}
