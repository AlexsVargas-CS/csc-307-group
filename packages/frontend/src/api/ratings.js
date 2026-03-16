const API_BASE =
  `${import.meta.env.VITE_API_URL || ""}` ||
  "http://localhost:3001";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Look up a Film document by tmdbId + type.
 * Returns { film } with the MongoDB _id.
 */
export async function lookupFilm(
  tmdbId,
  type = "movie"
) {
  const params = new URLSearchParams({
    tmdbId,
    type,
  });
  const res = await fetch(
    `${API_BASE}/api/films/lookup?${params}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.film;
}

/**
 * Submit or update a rating.
 * categoryRatings: [{ category, score }]
 */
export async function submitRating(
  filmId,
  { score, categoryRatings, reviewText },
  token
) {
  const res = await fetch(
    `${API_BASE}/api/ratings/${filmId}`,
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({
        score,
        categoryRatings,
        reviewText,
      }),
    }
  );
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to submit rating");
  }
  return res.json();
}

export async function deleteRating(filmId, token) {
  const res = await fetch(
    `${API_BASE}/api/ratings/${filmId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to delete rating");
  }
  return res.json();
}

/**
 * Get the current user's rating for a film.
 */
export async function getMyRating(
  filmId,
  token
) {
  const res = await fetch(
    `${API_BASE}/api/ratings/${filmId}/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.rating;
}

/**
 * Get community dimension averages for a film.
 * Returns { acting: { average, count }, ... }
 */
export async function getDimensions(filmId) {
  const res = await fetch(
    `${API_BASE}/api/ratings/${filmId}/dimensions`
  );
  if (!res.ok) return {};
  const data = await res.json();
  return data.dimensions;
}

/**
 * Get all ratings/reviews for a film.
 */
export async function getFilmRatings(
  filmId,
  { page = 1, limit = 20 } = {}
) {
  const params = new URLSearchParams({
    page,
    limit,
  });
  const res = await fetch(
    `${API_BASE}/api/ratings/${filmId}?${params}`
  );
  if (!res.ok)
    throw new Error("Failed to load ratings");
  return res.json();
}
