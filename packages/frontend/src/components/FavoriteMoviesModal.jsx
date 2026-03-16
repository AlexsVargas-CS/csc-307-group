import React, { useEffect, useState } from "react";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

function getPosterUrl(posterPath) {
  return posterPath
    ? `https://image.tmdb.org/t/p/w342${posterPath}`
    : "";
}

function getYear(releaseDate) {
  return releaseDate ? String(releaseDate).slice(0, 4) : "";
}

export default function FavoriteMoviesModal({
  isOpen,
  onClose,
  onSave,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingMovieId, setSavingMovieId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setQuery("");
    setResults([]);
    setError("");
    setLoading(false);
    setSavingMovieId(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_PREFIX}/api/tmdb/search?query=${encodeURIComponent(trimmed)}&type=movie&page=1`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Search failed ${res.status}: ${txt}`);
        }

        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to search movies.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, isOpen]);

  async function handleChooseMovie(movie) {
    setSavingMovieId(movie.tmdbId);
    setError("");

    try {
      await onSave([movie]);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save favorite.");
    } finally {
      setSavingMovieId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">Choose a Favorite Movie</h2>
            <p className="mt-1 text-sm text-gray-400">
              Search and click a movie poster to save it.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-700"
          >
            Close
          </button>
        </div>

        <div className="border-b border-gray-800 px-6 py-4">
          <input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="overflow-y-auto px-6 py-4">
          {!query.trim() ? (
            <p className="text-sm text-gray-500">
              Start typing to search for movies.
            </p>
          ) : loading ? (
            <p className="text-sm text-gray-400">Searching...</p>
          ) : error ? (
            <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-gray-500">No results found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {results.map((movie) => {
                const posterUrl = getPosterUrl(movie.posterPath);
                const isSaving = savingMovieId === movie.tmdbId;

                return (
                  <button
                    key={movie.tmdbId}
                    type="button"
                    onClick={() => handleChooseMovie(movie)}
                    disabled={isSaving}
                    className="group overflow-hidden rounded-xl text-left transition hover:scale-[1.02] disabled:opacity-60"
                  >
                    <div className="relative">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movie.title}
                          className="aspect-[2/3] w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-gray-800 text-sm text-gray-500">
                          No poster
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-25">
                      </div>
                    </div>

                    <div className="px-1 py-2">
                      <p className="line-clamp-2 text-sm font-semibold text-white">
                        {movie.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {getYear(movie.releaseDate) || "Unknown year"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}