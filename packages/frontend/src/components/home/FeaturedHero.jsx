import { Link } from "react-router-dom";
import { posterURL } from "../../api/tmdb.js";

export default function FeaturedHero({
  film,
  genreMap,
  onScrollToCategories,
}) {
  if (!film) return null;

  const backdrop = posterURL(
    film.backdropPath,
    "w1280",
  );
  const poster = posterURL(film.posterPath, "w342");
  const year = film.releaseDate?.slice(0, 4);
  const rating = film.voteAverage?.toFixed(1);
  const genres =
    genreMap && film.genreIds
      ? film.genreIds
          .slice(0, 3)
          .map((id) => genreMap.get(id))
          .filter(Boolean)
      : [];

  const overview =
    film.overview && film.overview.length > 200
      ? film.overview.slice(0, 200) + "…"
      : film.overview;

  return (
    <section className="relative h-[32rem] w-full overflow-hidden">
      {/* Backdrop image */}
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-gray-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-8">
        {/* Left: title + metadata */}
        <div className="max-w-xl">
          <p className="mb-2 text-sm font-medium tracking-widest text-amber-400 uppercase">
            Discover What to Watch
          </p>

          <h1 className="mb-3 text-4xl font-extrabold leading-tight text-white md:text-5xl">
            {film.title}
          </h1>

          {overview && (
            <p className="mb-4 text-base leading-relaxed text-gray-300">
              {overview}
            </p>
          )}

          {/* Genre pills */}
          {genres.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {genres.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-gray-600 px-3 py-1 text-xs font-medium text-gray-200"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Metadata row */}
          <div className="mb-6 flex items-center gap-4 text-sm text-gray-400">
            {rating && (
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
            )}
            {year && <span>{year}</span>}
            {film.voteCount > 0 && (
              <span>
                {film.voteCount.toLocaleString()} votes
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Link
              to={`/film/${film.type || "movie"}/${film.tmdbId}`}
              className="rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-gray-950 transition hover:bg-amber-400"
            >
              Explore Movie
            </Link>
            <button
              onClick={onScrollToCategories}
              className="rounded-lg border border-gray-500 px-6 py-2.5 font-semibold text-gray-200 transition hover:border-gray-300 hover:text-white"
            >
              Compare Community Ratings
            </button>
          </div>
        </div>

        {/* Right: floating stat card */}
        <div className="hidden lg:block">
          <div className="w-56 overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/80 shadow-2xl backdrop-blur">
            {poster && (
              <img
                src={poster}
                alt={`${film.title} poster`}
                className="aspect-[2/3] w-full object-cover"
              />
            )}
            <div className="p-4">
              <div className="mb-2 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                Trending now
              </div>
              {rating && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {rating}
                  </span>
                  <span className="text-xs text-gray-400">
                    TMDB Rating
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
