import { Link } from "react-router-dom";
import { posterURL } from "../../api/tmdb.js";
import HomeSectionHeader from "./HomeSectionHeader.jsx";
import { CompactListSkeleton } from "./HomeSkeletons.jsx";

export default function MostDiscussedList({
  films,
  loading,
}) {
  if (loading) {
    return (
      <div>
        <HomeSectionHeader title="Most Discussed" />
        <CompactListSkeleton />
      </div>
    );
  }

  if (!films || films.length === 0) return null;

  return (
    <div>
      <HomeSectionHeader
        title="Most Discussed"
        subtitle="Trending hard this week"
      />
      <div className="space-y-3">
        {films.map((film, idx) => {
          const img = posterURL(
            film.posterPath,
            "w154",
          );
          const rating =
            film.voteAverage?.toFixed(1);

          return (
            <Link
              key={film.tmdbId}
              to={`/media/${film.type || "movie"}/${film.tmdbId}`}
              className="flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/40 p-2 transition hover:border-gray-700 hover:bg-gray-800/40"
            >
              <span className="w-5 text-center text-sm font-bold text-gray-500">
                {idx + 1}
              </span>
              {img && (
                <img
                  src={img}
                  alt={`${film.title} poster`}
                  className="h-16 w-11 rounded object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-white">
                  {film.title}
                </h4>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  {rating && (
                    <span className="text-amber-400">
                      ★ {rating}
                    </span>
                  )}
                  {film.voteCount > 0 && (
                    <span>
                      {film.voteCount.toLocaleString()}{" "}
                      votes
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
