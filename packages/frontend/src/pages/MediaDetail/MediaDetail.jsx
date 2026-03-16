import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams, Link } from "react-router-dom";
import {
  getFilmDetails,
  getSimilarFilms,
  posterURL,
} from "../../api/tmdb.js";
import {
  lookupFilm,
  getDimensions,
  getFilmRatings,
} from "../../api/ratings.js";
import DimensionBar from "../../components/DimensionBar/DimensionBar.jsx";
import ReviewCard from "../../components/ReviewCard/ReviewCard.jsx";
import LogModal from "../../components/LogModal/LogModal.jsx";
import { DIMENSION_LABELS } from "../../data/mockMediaData.js";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MediaDetail() {
  const { mediaType, id } = useParams();
  const [film, setFilm] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlisted, setWatchlisted] =
    useState(false);
  const [watchlistLoading, setWatchlistLoading] =
    useState(false);
  const [logOpen, setLogOpen] = useState(false);

  // Rating state from backend
  const [dimensions, setDimensions] = useState(
    {}
  );
  const [reviews, setReviews] = useState([]);

  const fetchWatchlistState = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWatchlisted(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/me`,
        {
          headers: authHeaders(),
        }
      );

      if (!res.ok) {
        setWatchlisted(false);
        return;
      }

      const data = await res.json();
      const watchlist = Array.isArray(data.watchlist)
        ? data.watchlist
        : [];

      setWatchlisted(
        watchlist.includes(Number(id))
      );
    } catch {
      setWatchlisted(false);
    }
  }, [id]);

  const handleWatchlistToggle = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to use the watchlist.");
      return;
    }

    setWatchlistLoading(true);

    try {
      const method = watchlisted ? "DELETE" : "POST";

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/watchlist/${id}`,
        {
          method,
          headers: authHeaders(),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Watchlist update failed");
      }

      setWatchlisted((prev) => !prev);
    } catch (err) {
      setError(
        err.message || "Failed to update watchlist."
      );
    } finally {
      setWatchlistLoading(false);
    }
  }, [id, watchlisted]);

  const fetchRatings = useCallback(async () => {
    const filmDoc = await lookupFilm(
      id,
      mediaType
    );
    if (!filmDoc) return;

    const [dims, ratingsData] =
      await Promise.all([
        getDimensions(filmDoc._id),
        getFilmRatings(filmDoc._id),
      ]);

    setDimensions(dims);
    setReviews(
      (ratingsData.ratings || []).map((r) => ({
        id: r._id,
        userId: r.userId?._id || r.userId,
        username:
          r.userId?.username || "Anonymous",
        avatarUrl: null,
        overallStarRating: r.score,
        content: r.reviewText || "",
        likeCount: 0,
        isLikedByCurrentUser: false,
        createdAt: r.createdAt,
      }))
    );
  }, [id, mediaType]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getFilmDetails(mediaType, id),
      getSimilarFilms(mediaType, id),
    ])
      .then(([detailsRes, similarRes]) => {
        if (cancelled) return;
        const item = detailsRes.item;
        setFilm({
          title: item.title,
          year: (item.releaseDate || "").slice(
            0,
            4
          ),
          overview: item.description,
          posterUrl: posterURL(item.posterPath),
          genres: (item.genres || []).map(
            (g) => g.name
          ),
          director:
            item.credits?.crew?.find(
              (c) => c.job === "Director"
            )?.name || null,
        });
        setSimilar(
          similarRes.map((s) => ({
            tmdbId: s.tmdbId,
            title: s.title,
            posterUrl: posterURL(s.posterPath),
            mediaType: s.type,
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetchRatings();
    fetchWatchlistState();

    return () => {
      cancelled = true;
    };
  }, [mediaType, id, fetchRatings, fetchWatchlistState]);

  if (loading) {
    return (
      <p className="p-8 text-gray-400">
        Loading...
      </p>
    );
  }
  if (error) {
    return (
      <p className="p-8 text-red-400">{error}</p>
    );
  }
  if (!film) return null;

  const hasDimensions =
    Object.keys(dimensions).length > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* ── ZONE 1 + ZONE 2 — Hero + Dimensional Ratings ── */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Poster */}
        <div className="shrink-0">
          {film.posterUrl ? (
            <img
              src={film.posterUrl}
              alt={film.title}
              className="w-64 rounded-lg shadow-lg shadow-black/40 sm:w-72"
            />
          ) : (
            <div className="flex h-[400px] w-64 items-center justify-center rounded-lg bg-gray-800 text-gray-500 sm:w-72">
              No poster
            </div>
          )}
        </div>

        {/* Metadata + Actions */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {film.title}
          </h1>
          <p className="mt-1 text-lg text-gray-400">
            {film.year}
          </p>

          {film.director && (
            <p className="mt-2 text-sm text-gray-400">
              Directed by{" "}
              <span className="text-white">
                {film.director}
              </span>
            </p>
          )}

          <p className="mt-4 max-w-xl leading-relaxed text-gray-300">
            {film.overview}
          </p>

          {/* Genre tags */}
          {film.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {film.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-gray-600 bg-white/5 px-3 py-1 text-xs text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                watchlisted
                  ? "bg-amber-400 text-black"
                  : "border border-gray-600 text-gray-300 hover:border-amber-400 hover:text-amber-400"
              }`}
            >
              {watchlistLoading
                ? "Saving..."
                : watchlisted
                ? "\u2713 Watchlisted"
                : "+ Watchlist"}
            </button>
            <button
              onClick={() => setLogOpen(true)}
              className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-500"
            >
              Log
            </button>
          </div>
        </div>

        {/* Dimensional Ratings (sidebar on desktop) */}
        <div className="w-full shrink-0 lg:w-64">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Community Ratings
          </h2>
          {hasDimensions ? (
            Object.keys(DIMENSION_LABELS).map(
              (key) => {
                const data = dimensions[key];
                if (!data) return null;
                return (
                  <DimensionBar
                    key={key}
                    label={
                      DIMENSION_LABELS[key]
                    }
                    average={data.average * 2}
                    count={data.count}
                  />
                );
              }
            )
          ) : (
            <p className="text-sm text-gray-500">
              No ratings yet. Be the first!
            </p>
          )}
        </div>
      </div>

      {/* ── ZONE 3 — Reviews ── */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white">
          Reviews
        </h2>
        <hr className="mt-2 mb-6 border-gray-800" />

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No reviews yet.
          </p>
        )}
      </section>

      {/* ── ZONE 4 — Similar Films ── */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white">
            Similar Films
          </h2>
          <hr className="mt-2 mb-6 border-gray-800" />

          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{
              scrollbarWidth: "none",
            }}
          >
            {similar.map((s) => (
              <Link
                key={s.tmdbId}
                to={`/media/${s.mediaType}/${s.tmdbId}`}
                className="group shrink-0"
              >
                {s.posterUrl ? (
                  <img
                    src={s.posterUrl}
                    alt={s.title}
                    className="h-52 w-36 rounded-lg object-cover shadow-md transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-52 w-36 items-center justify-center rounded-lg bg-gray-800 text-center text-xs text-gray-500">
                    {s.title}
                  </div>
                )}
                <p className="mt-2 w-36 truncate text-sm text-gray-300 group-hover:text-white">
                  {s.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── ZONE 5 — Log Modal ── */}
      <LogModal
        isOpen={logOpen}
        onClose={() => setLogOpen(false)}
        mediaId={id}
        mediaType={mediaType}
        onSubmitted={fetchRatings}
      />
    </main>
  );
}
