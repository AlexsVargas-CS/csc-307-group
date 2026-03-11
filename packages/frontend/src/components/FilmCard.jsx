import { Link } from "react-router-dom";
import { posterURL } from "../api/tmdb.js";

export default function FilmCard({ film }) {
  const img = posterURL(film.posterPath);

  return (
    <Link
      to={`/film/${film.type}/${film.tmdbId}`}
      className="group overflow-hidden rounded-lg bg-gray-800 shadow transition hover:shadow-xl hover:ring-1 hover:ring-amber-400/50">
      {img ? (
        <img
          src={img}
          alt={film.title}
          className="aspect-[2/3] w-full object-cover transition group-hover:scale-105"
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
        {film.releaseDate && (
          <p className="text-xs text-gray-400">
            {film.releaseDate.slice(0, 4)}
          </p>
        )}
      </div>
    </Link>
  );
}
