import React, { useEffect, useMemo, useState } from "react";

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
  initialFavorites = [],
  onSave,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState(initialFavorites);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setSelectedMovies(initialFavorites);
    setQuery("");
    setResults([]);
    setError("");
    setLoading(false);
    setSaving(false);
  }, [isOpen, initialFavorites]);

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

  const selectedIds = useMemo(() => {
    return new Set(selectedMovies.map((movie) => movie.tmdbId));
  }, [selectedMovies]);

  function handleAddMovie(movie) {
    setSelectedMovies([movie]);
  }

  function handleRemoveMovie(tmdbId) {
    setSelectedMovies((prev) => prev.filter((movie) => movie.tmdbId !== tmdbId));
  }

  function moveMovie(index, direction) {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedMovies.length) return;

    setSelectedMovies((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIndex];
      copy[newIndex] = temp;
      return copy;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      await onSave(selectedMovies);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save favorites.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Top 5 Favorites</h2>
            <p className="mt-1 text-sm text-gray-400">
              Search for movies and choose up to 5 favorites.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-700"
          >
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.2fr_0.8fr]">
          <div className="min-h-0 border-b border-gray-800 md:border-b-0 md:border-r">
            <div className="border-b border-gray-800 px-6 py-4">
              <input
                type="text"
                placeholder="Search for a movie..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-gray-700 focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-6 py-4 md:max-h-none">
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
                <div className="space-y-3">
                  {results.map((movie) => {
                    const alreadySelected = selectedIds.has(movie.tmdbId);

                    return (
                      <div
                        key={movie.tmdbId}
                        className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-950/60 p-3"
                      >
                        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md bg-gray-800">
                          {movie.posterPath ? (
                            <img
                              src={getPosterUrl(movie.posterPath)}
                              alt={movie.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                              No poster
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 font-semibold text-white">
                            {movie.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-400">
                            {getYear(movie.releaseDate) || "Unknown year"}
                          </p>
                          {movie.description && (
                            <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                              {movie.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <button
                            onClick={() => handleAddMovie(movie)}
                            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
                          >
                            {alreadySelected ? "Selected" : "Choose"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0">
            <div className="border-b border-gray-800 px-6 py-4">
              <h3 className="font-semibold text-white">
                Selected Movie
              </h3>
            </div>

            <div className="max-h-[40vh] overflow-y-auto px-6 py-4 md:max-h-none">
              {selectedMovies.length === 0 ? (
                <p className="text-sm text-gray-500">No favorite movies selected yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedMovies.length === 0 ? (
                    <p className="text-sm text-gray-500">No movie selected yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedMovies.map((movie) => (
                        <div
                          key={movie.tmdbId}
                          className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950/60 p-3"
                        >
                          <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-gray-800">
                            {movie.posterPath ? (
                              <img
                                src={getPosterUrl(movie.posterPath)}
                                alt={movie.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                                No poster
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">{movie.title}</p>
                            <p className="text-sm text-gray-400">
                              {getYear(movie.releaseDate) || "Unknown year"}
                            </p>
                          </div>

                          <button
                            onClick={() => setSelectedMovies([])}
                            className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-700 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save favorites"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}