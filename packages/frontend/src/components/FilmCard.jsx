import { Link } from "react-router-dom";
import {
  posterURL
} from "../api/tmdb.js";

export default function FilmCard({
  film,
  genreMap
}) {
  const img = posterURL(film.posterPath, "w342");

  const genres =
    genreMap && film.genreIds
      ? film.genreIds
          .slice(0, 2)
          .map((id) => genreMap.get(id))
          .filter(Boolean)
      : [];

  return (
    <Link
      to={`/film/${film.type || "movie"}/${film.tmdbId}`}
      className="group block overflow-hidden rounded-lg bg-gray-800 shadow transition hover:shadow-xl hover:ring-1 hover:ring-amber-400/50"
    >
      {img ? (
        <img
          src={img}
          alt={film.title}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-gray-700 text-sm text-gray-400">
          No poster
        </div>
      )}
      <div className="p-3">
        <h3 className="truncate text-sm font-medium">
          {film.title}
        </h3>
        {genres.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {genres.map((name) => (
              <span
                key={name}
                className="rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-medium text-gray-300"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
