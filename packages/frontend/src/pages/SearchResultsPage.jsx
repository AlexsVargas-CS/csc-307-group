import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchFilms } from "../api/tmdb.js";
import { searchUsers } from "../api/users.js";
import FilmCard from "../components/FilmCard.jsx";
import UserCard from "../components/UserCard.jsx";

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const query = params.get("query") || "";
  const [filmResults, setFilmResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      searchFilms(query),
      searchUsers(query),
    ])
      .then(([filmData, userData]) => {
        if (cancelled) return;
        setFilmResults(filmData.results);
        setUserResults(userData.results);
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

  const noResults =
    !loading &&
    filmResults.length === 0 &&
    userResults.length === 0 &&
    query;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-bold">
        {query
          ? `Results for "${query}"`
          : "Search for films or users"}
      </h2>

      {loading && (
        <p className="text-gray-400">
          Searching...
        </p>
      )}
      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {noResults && (
        <p className="text-gray-400">
          No results found.
        </p>
      )}

      {userResults.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-300">
            Users
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {userResults.map((user) => (
              <UserCard
                key={user.username}
                user={user}
              />
            ))}
          </div>
        </section>
      )}

      {filmResults.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold text-gray-300">
            Films
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filmResults.map((film) => (
              <FilmCard
                key={`${film.type}-${film.tmdbId}`}
                film={film}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
