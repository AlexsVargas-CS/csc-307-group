import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FilmCard from "../components/FilmCard.jsx";

const API_PREFIX =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Watchlist() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [genreMap, setGenreMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isOwner = useMemo(() => {
    return me?.username === username;
  }, [me, username]);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setMessage("");

      try {
        const watchlistRes = await fetch(`${API_PREFIX}/api/users/${username}/watchlist`, {
          headers: {
            ...authHeaders(),
          },
        });
        if (!watchlistRes.ok) {
          if (watchlistRes.status === 403) {
            throw new Error("This watchlist is private.");
          }

          const txt = await watchlistRes.text();
          throw new Error(`Watchlist load failed ${watchlistRes.status}: ${txt}`);
        }

        const watchlistData = await watchlistRes.json();

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

        setProfile(watchlistData);
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
        // ignore
      }
    }

    loadGenres();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWatchlistMovies() {
      const ids = (profile?.watchlist || [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);

      if (!ids.length) {
        setWatchlistMovies([]);
        return;
      }

      setMoviesLoading(true);
      setMessage("");

      try {
        const movies = await Promise.all(
          ids.map(async (tmdbId) => {
            const res = await fetch(`${API_PREFIX}/api/tmdb/movie/${tmdbId}`);

            if (!res.ok) {
              const txt = await res.text();
              throw new Error(`Watchlist movie load failed ${res.status}: ${txt}`);
            }

            const data = await res.json();
            const item = data.item;

            return {
              tmdbId: item.tmdbId ?? item.id ?? tmdbId,
              title: item.title ?? item.name ?? "Untitled",
              posterPath: item.posterPath ?? item.poster_path ?? "",
              genreIds:
                item.genreIds ??
                item.genre_ids ??
                item.genres?.map((g) => g.id) ??
                [],
              type: "movie",
              releaseDate: item.releaseDate ?? item.release_date ?? "",
              voteAverage: item.voteAverage ?? item.vote_average ?? null,
            };
          })
        );

        if (!cancelled) {
          setWatchlistMovies(movies);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err.message);
          setWatchlistMovies([]);
        }
      } finally {
        if (!cancelled) {
          setMoviesLoading(false);
        }
      }
    }

    if (profile) {
      loadWatchlistMovies();
    }

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (loading) {
    return <p className="p-8 text-gray-400">Loading...</p>;
  }

  if (message && !profile) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link to={`/profile/${username}`} className="mb-4 inline-block text-sm text-amber-400 hover:underline">
        &larr; Back to profile
      </Link>

      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isOwner ? "Your Watchlist" : `${profile.username}'s Watchlist`}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isOwner ? "Movies you want to watch." : `Movies ${profile.username} wants to watch.`}
            </p>
          </div>

          <div className="text-sm text-gray-400">
            {(profile.watchlist || []).length} movie{(profile.watchlist || []).length === 1 ? "" : "s"}
          </div>
        </div>

        {message && (
          <p className="mt-6 rounded-lg border border-gray-800 bg-gray-950 p-3 text-sm text-gray-300">
            {message}
          </p>
        )}

        {moviesLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[2/3] animate-pulse rounded-xl bg-gray-800"
              />
            ))}
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-gray-700 bg-gray-800/40 p-8 text-center">
            <p className="text-gray-300">
              {isOwner ? "Your watchlist is empty." : `${profile.username}'s watchlist is empty.`}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {watchlistMovies.map((film) => (
              <FilmCard
                key={film.tmdbId}
                film={film}
                genreMap={genreMap}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}