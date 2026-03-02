import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getFilmDetails, posterURL } from "../api/tmdb.js";

export default function FilmDetailPage() {
  const { type, tmdbId } = useParams();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getFilmDetails(type, tmdbId)
      .then((data) => {
        if (!cancelled) setFilm(data.item);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type, tmdbId]);

  if (loading) {
    return <p className="p-8 text-gray-400">Loading...</p>;
  }
  if (error) {
    return <p className="p-8 text-red-400">{error}</p>;
  }
  if (!film) return null;

  const img = posterURL(film.posterPath);
  const director = film.credits?.crew?.find(
    (c) => c.job === "Director",
  );
  const cast = film.credits?.cast?.slice(0, 10) || [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-amber-400 hover:underline">
        &larr; Back
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        {img ? (
          <img
            src={img}
            alt={film.title}
            className="w-64 shrink-0 self-start rounded-lg shadow-lg"
          />
        ) : (
          <div className="flex h-96 w-64 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-gray-500">
            No poster
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{film.title}</h1>

          {film.releaseDate && (
            <p className="mt-1 text-gray-400">
              {film.releaseDate.slice(0, 4)}
            </p>
          )}

          {film.genres?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {film.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {director && (
            <p className="mt-4 text-sm text-gray-400">
              Directed by{" "}
              <span className="text-white">
                {director.name}
              </span>
            </p>
          )}

          <p className="mt-4 leading-relaxed text-gray-300">
            {film.description}
          </p>

          {cast.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">
                Cast
              </h2>
              <div className="flex flex-wrap gap-2">
                {cast.map((c) => (
                  <span
                    key={c.name + c.character}
                    className="rounded bg-gray-800 px-2 py-1 text-xs">
                    {c.name}
                    {c.character && (
                      <span className="text-gray-500">
                        {" "}
                        as {c.character}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
