import { Link } from "react-router-dom";
import { posterURL } from "../../api/tmdb.js";

export default function CategorySpotlightCard({
  category,
}) {
  const { name, label, film } = category;
  const img = posterURL(film.posterPath, "w342");
  const rating = film.voteAverage?.toFixed(1);
  const year = film.releaseDate?.slice(0, 4);

  return (
    <Link
      to={`/media/${film.type || "movie"}/${film.tmdbId}`}
      className="group relative flex overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 transition hover:border-gray-600"
    >
      {/* Poster side */}
      <div className="w-28 flex-shrink-0">
        {img ? (
          <img
            src={img}
            alt={`${film.title} poster`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-800 text-xs text-gray-500">
            No poster
          </div>
        )}
      </div>

      {/* Info side */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="mb-1 inline-block text-xs font-bold tracking-wider text-amber-400 uppercase">
            {name}
          </span>
          <h3 className="mb-1 text-base font-semibold leading-snug text-white">
            {film.title}
          </h3>
          <p className="text-xs text-gray-400">
            {label}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          {rating && (
            <span className="flex items-center gap-1 text-amber-400">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating}
            </span>
          )}
          {year && <span>{year}</span>}
        </div>
      </div>
    </Link>
  );
}
