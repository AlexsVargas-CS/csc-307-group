import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchFilms } from "../api/tmdb.js";
import FilmCard from "../components/FilmCard.jsx";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const query = params.get("query") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchFilms(query)
      .then((data) => {
        if (!cancelled) setResults(data.results);
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
  }, [query]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-bold">
        {query ? `Results for "${query}"` : "Search for a film"}
      </h2>

      {loading && <p className="text-gray-400">Searching...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && results.length === 0 && query && (
        <p className="text-gray-400">No results found.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map((film) => (
          <FilmCard key={film.tmdbId} film={film} />
        ))}
      </div>
    </main>
  );
}
