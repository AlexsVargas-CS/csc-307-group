import { posterURL } from "../../api/tmdb.js";

export default function CuratedListTile({ list }) {
  const { title, description, films } = list;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60 p-5 transition hover:border-gray-600">
      <h3 className="mb-1 text-base font-bold text-white">
        {title}
      </h3>
      <p className="mb-4 text-xs text-gray-400">
        {description}
      </p>

      {/* Poster collage */}
      <div className="flex gap-2">
        {films.slice(0, 4).map((film) => {
          const img = posterURL(
            film.posterPath,
            "w154",
          );
          return (
            <div
              key={film.tmdbId}
              className="w-1/4 overflow-hidden rounded-lg"
            >
              {img ? (
                <img
                  src={img}
                  alt={`${film.title} poster`}
                  className="aspect-[2/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-gray-800 text-[8px] text-gray-500">
                  N/A
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
