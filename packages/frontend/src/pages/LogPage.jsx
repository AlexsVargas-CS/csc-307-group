import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FilmCard from "../components/FilmCard.jsx";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const COMMUNITY_CATEGORIES = [
  "acting",
  "cinematography",
  "soundtrack",
  "soundDesign",
  "artDirection",
  "writing",
];

export default function LogPage() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [loggedMovies, setLoggedMovies] = useState([]);
  const [genreMap, setGenreMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState("logged-desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const isOwner = useMemo(() => {
    return me?.username === username;
  }, [me, username]);

  function getCommunityCategoryAverage(film, category) {
    return Number(film.communityCategoryAverages?.[category]?.average) || 0;
  }

  const availableGenres = useMemo(() => {
    const seen = new Map();

    loggedMovies.forEach((film) => {
      (film.genreIds || []).forEach((genreId) => {
        const numericId = Number(genreId);
        const name = genreMap.get(numericId);

        if (name) {
          seen.set(numericId, name);
        }
      });
    });

    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [loggedMovies, genreMap]);

  const displayedMovies = useMemo(() => {
    let next = [...loggedMovies];

    if (selectedGenres.length > 0) {
      next = next.filter((film) =>
        (film.genreIds || []).some((genreId) =>
          selectedGenres.includes(Number(genreId))
        )
      );
    }

    next.sort((a, b) => {
      if (sortBy === "logged-desc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === "logged-asc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortBy === "title-desc") {
        return (b.title || "").localeCompare(a.title || "");
      }

      if (sortBy === "year-asc") {
        return (a.releaseYear || 0) - (b.releaseYear || 0);
      }

      if (sortBy === "year-desc") {
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      }

      if (sortBy === "rating-desc") {
        return (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0);
      }

      if (sortBy === "rating-asc") {
        return (Number(a.avgRating) || 0) - (Number(b.avgRating) || 0);
      }

      if (sortBy === "user-rating-desc") {
        return (Number(b.userRating) || 0) - (Number(a.userRating) || 0);
      }

      if (sortBy === "user-rating-asc") {
        return (Number(a.userRating) || 0) - (Number(b.userRating) || 0);
      }

      const categorySortMatch = sortBy.match(
        /^(acting|cinematography|soundtrack|soundDesign|artDirection|writing)-(asc|desc)$/
      );

      if (categorySortMatch) {
        const [, category, direction] = categorySortMatch;

        const aScore = getCommunityCategoryAverage(a, category);
        const bScore = getCommunityCategoryAverage(b, category);

        if (direction === "desc") {
          return bScore - aScore;
        }

        return aScore - bScore;
      }

      return 0;
    });

    return next;
  }, [loggedMovies, selectedGenres, sortBy]);

  function toggleGenre(genreId) {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setMessage("");

      try {
        const logsRes = await fetch(
          `${API_PREFIX}/api/users/${username}/logs`,
          {
            headers: {
              ...authHeaders(),
            },
          }
        );

        if (!logsRes.ok) {
          const txt = await logsRes.text();
          throw new Error(`Logs load failed ${logsRes.status}: ${txt}`);
        }

        const logsData = await logsRes.json();

        const token = localStorage.getItem("token");
        let meData = null;

        if (token) {
          const meRes = await fetch(`${API_PREFIX}/api/me`, {
            headers: authHeaders(),
          });

          if (meRes.ok) {
            meData = await meRes.json();
          }
        }

        if (cancelled) return;

        setProfile(logsData);
        setMe(meData);
      } catch (err) {
        if (!cancelled) {
          setMessage(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    let cancelled = false;

    async function loadGenres() {
      try {
        const res = await fetch(`${API_PREFIX}/api/tmdb/genres`);
        if (!res.ok) return;

        const data = await res.json();
        const genres = data.genres || data.items || [];

        const nextMap = new Map(
          genres.map((genre) => [Number(genre.id), genre.name])
        );

        if (!cancelled) {
          setGenreMap(nextMap);
        }
      } catch {
        //
      }
    }

    loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLoggedMovies() {
      const items = Array.isArray(profile?.items) ? profile.items : [];

      if (!items.length) {
        setLoggedMovies([]);
        return;
      }

      setMoviesLoading(true);
      setMessage("");

      try {
        const movies = await Promise.all(
          items.map(async (entry) => {
            const res = await fetch(`${API_PREFIX}/api/tmdb/movie/${entry.tmdbId}`);

            if (!res.ok) {
              const txt = await res.text();
              throw new Error(`Logged movie load failed ${res.status}: ${txt}`);
            }

            const data = await res.json();
            const item = data.item;

            return {
              ratingId: entry.ratingId,
              tmdbId: item.tmdbId ?? item.id ?? entry.tmdbId,
              title: item.title ?? item.name ?? "Untitled",
              posterPath: item.posterPath ?? item.poster_path ?? "",
              genreIds:
                item.genreIds ??
                item.genre_ids ??
                item.genres?.map((g) => g.id) ??
                [],
              type: "movie",
              releaseDate: item.releaseDate ?? item.release_date ?? "",
              releaseYear: (entry.releaseYear ?? Number((item.releaseDate ?? "").slice(0, 4))) || null,
              avgRating: entry.avgRating ?? null,
              ratingCount: entry.ratingCount ?? 0,
              userRating: entry.userRating ?? null,
              reviewText: entry.reviewText ?? "",
              communityCategoryAverages: entry.communityCategoryAverages ?? {},
              createdAt: entry.createdAt,
            };
          })
        );

        if (!cancelled) {
          setLoggedMovies(movies);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err.message);
          setLoggedMovies([]);
        }
      } finally {
        if (!cancelled) {
          setMoviesLoading(false);
        }
      }
    }

    if (profile) {
      loadLoggedMovies();
    }

    return () => {
      cancelled = true;
    };
  }, [profile]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setFiltersOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return <p className="p-8 text-gray-400">Loading...</p>;
  }

  if (message && !profile) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-red-300">
          {message}
        </p>
        <Link to="/" className="mt-4 inline-block text-amber-400 hover:underline">
          &larr; Back
        </Link>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={`/profile/${username}`}
        className="mb-4 inline-block text-sm text-amber-400 hover:underline"
      >
        &larr; Back to profile
      </Link>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isOwner ? "Your Logs" : `${profile.username}'s Logs`}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isOwner ? "Films you have reviewed." : `Films ${profile.username} has reviewed.`}
            </p>
          </div>

          <div className="text-sm text-gray-400">
            {(profile.items || []).length} film{(profile.items || []).length === 1 ? "" : "s"}
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm text-gray-300">
            {message}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-gray-800 py-3">
          <div className="flex items-center gap-2">
            <div ref={filterDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700"
              >
                Filter
              </button>

              {filtersOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-800 bg-gray-900 p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Genres
                    </p>
                    {selectedGenres.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedGenres([])}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {availableGenres.length === 0 ? (
                    <p className="text-sm text-gray-500">No genres available.</p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {availableGenres.map((genre) => (
                        <label
                          key={genre.id}
                          className="flex items-center gap-2 text-sm text-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre.id)}
                            onChange={() => toggleGenre(genre.id)}
                            className="h-4 w-4 accent-amber-400"
                          />
                          <span>{genre.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-xs text-gray-500">
              {selectedGenres.length > 0
                ? `${selectedGenres.length} selected`
                : "No filters"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="logged-desc">Logged (Newest)</option>
              <option value="logged-asc">Logged (Oldest)</option>
              <option value="title-asc">Title (A–Z)</option>
              <option value="title-desc">Title (Z–A)</option>
              <option value="year-desc">Year (Newest)</option>
              <option value="year-asc">Year (Oldest)</option>
              <option value="rating-desc">Community Rating (Highest)</option>
              <option value="rating-asc">Community Rating (Lowest)</option>
              <option value="user-rating-desc">Your Rating (Highest)</option>
              <option value="user-rating-asc">Your Rating (Lowest)</option>
              <option value="acting-desc">Acting (Highest)</option>
              <option value="acting-asc">Acting (Lowest)</option>
              <option value="cinematography-desc">Cinematography (Highest)</option>
              <option value="cinematography-asc">Cinematography (Lowest)</option>
              <option value="soundtrack-desc">Soundtrack (Highest)</option>
              <option value="soundtrack-asc">Soundtrack (Lowest)</option>
              <option value="soundDesign-desc">Sound Design (Highest)</option>
              <option value="soundDesign-asc">Sound Design (Lowest)</option>
              <option value="artDirection-desc">Art Direction (Highest)</option>
              <option value="artDirection-asc">Art Direction (Lowest)</option>
              <option value="writing-desc">Writing (Highest)</option>
              <option value="writing-asc">Writing (Lowest)</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSelectedGenres([]);
                setSortBy("logged-desc");
              }}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>

        {moviesLoading ? (
          <div className="mt-6 grid justify-center gap-5 [grid-template-columns:repeat(auto-fill,minmax(150px,180px))]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] animate-pulse rounded-xl bg-gray-800"
              />
            ))}
          </div>
        ) : loggedMovies.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-700 bg-gray-800/40 p-8 text-center">
            <p className="text-gray-300">
              {isOwner ? "You have not logged any films yet." : `${profile.username} has not logged any films yet.`}
            </p>
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-700 bg-gray-800/40 p-8 text-center">
            <p className="text-gray-300">No films match the selected filters.</p>
            <p className="mt-2 text-sm text-gray-500">
              Try removing some genre filters or changing the sort.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid justify-center gap-5 [grid-template-columns:repeat(auto-fill,minmax(150px,180px))]">
            {displayedMovies.map((film) => (
              <div key={film.ratingId} className="flex flex-col">
                <FilmCard
                  film={film}
                  genreMap={genreMap}
                />
                <div className="mt-2 rounded-lg bg-gray-800 px-3 py-2 text-center text-sm font-medium text-amber-300">
                  ★ {Number(film.userRating).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}