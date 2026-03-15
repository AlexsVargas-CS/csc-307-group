import { Link } from "react-router-dom";
import { posterURL } from "../../api/tmdb.js";

export default function PulseCard({ film, genreMap }) {
  const img = posterURL(film.backdropPath || film.posterPath, "w780");
  const year = film.releaseDate?.slice(0, 4);
  const rating = film.voteAverage?.toFixed(1);
  const genres =
    genreMap && film.genreIds
      ? film.genreIds
          .slice(0, 2)
          .map((id) => genreMap.get(id))
          .filter(Boolean)
      : [];

  const excerpt =
    film.overview && film.overview.length > 120
      ? film.overview.slice(0, 120) + "…"
      : film.overview;

  return (
    <Link
      to={`/film/${film.type || "movie"}/${film.tmdbId}`}
      className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 transition hover:border-gray-600"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={`${film.title} backdrop`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-800 text-xs text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <span className="absolute bottom-2 left-3 rounded-full bg-gray-900/70 px-2 py-0.5 text-[10px] font-medium text-amber-400 backdrop-blur">
          In the conversation this week
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-base font-semibold text-white">
          {film.title}
        </h3>
        {excerpt && (
          <p className="mb-3 text-xs leading-relaxed text-gray-400">
            {excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
          {rating && (
            <span className="text-amber-400">
              ★ {rating}
            </span>
          )}
          {year && <span>{year}</span>}
          {genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
