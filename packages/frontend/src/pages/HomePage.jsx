import {
  useState,
  useEffect,
  useCallback
} from "react";
import HeroSection from "../components/HeroSection/HeroSection.jsx";
import FilmRow from "../components/FilmRow/FilmRow.jsx";
import {
  fetchTrending,
  fetchNewReleases,
  fetchByGenre,
  fetchGenres
} from "../api/tmdb.js";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURED_GENRES = [
  { id: 28, name: "Action" },
  { id: 18, name: "Drama" },
  { id: 35, name: "Comedy" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" }
];

export default function HomePage() {
  const { isAuthenticated, user, token } =
    useAuth();

  const [genreMap, setGenreMap] = useState(null);

  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] =
    useState(true);
  const [trendingError, setTrendingError] =
    useState(false);

  const [newReleases, setNewReleases] = useState(
    []
  );
  const [newReleasesLoading, setNewReleasesLoading] =
    useState(true);
  const [newReleasesError, setNewReleasesError] =
    useState(false);

  const [genreFilms, setGenreFilms] = useState(
    []
  );
  const [genreLoading, setGenreLoading] =
    useState(true);
  const [genreError, setGenreError] =
    useState(false);
  const [genreTitle, setGenreTitle] = useState(
    "Popular Films"
  );

  const loadGenreSection = useCallback(async () => {
    setGenreLoading(true);
    setGenreError(false);
    try {
      let genreId;
      let genreName;

      if (isAuthenticated && token) {
        const API_PREFIX =
          import.meta.env.VITE_API_URL ||
          "http://localhost:3001";
        const res = await fetch(
          `${API_PREFIX}/api/users/${user.username}`
        );
        if (res.ok) {
          const profile = await res.json();
          if (
            profile.favoriteGenres?.length > 0
          ) {
            setGenreTitle("For You");
            const genreIds = profile.favoriteGenres
              .map((name) => {
                const entry =
                  FEATURED_GENRES.find(
                    (g) =>
                      g.name.toLowerCase() ===
                      name.toLowerCase()
                  );
                return entry?.id;
              })
              .filter(Boolean);

            if (genreIds.length > 0) {
              const films = await fetchByGenre(
                genreIds.join(",")
              );
              setGenreFilms(films);
              setGenreLoading(false);
              return;
            }
          }
        }
      }

      const pick =
        FEATURED_GENRES[
          Math.floor(
            Math.random() * FEATURED_GENRES.length
          )
        ];
      genreId = pick.id;
      genreName = pick.name;
      setGenreTitle(`Popular in ${genreName}`);

      const films = await fetchByGenre(genreId);
      setGenreFilms(films);
    } catch {
      setGenreError(true);
    } finally {
      setGenreLoading(false);
    }
  }, [isAuthenticated, token, user]);

  useEffect(() => {
    fetchGenres()
      .then(setGenreMap)
      .catch(() => {});

    fetchTrending()
      .then(setTrending)
      .catch(() => setTrendingError(true))
      .finally(() => setTrendingLoading(false));

    fetchNewReleases()
      .then(setNewReleases)
      .catch(() => setNewReleasesError(true))
      .finally(() =>
        setNewReleasesLoading(false)
      );

    loadGenreSection();
  }, [loadGenreSection]);

  return (
    <main className="mx-auto max-w-7xl pb-12">
      <HeroSection />

      <FilmRow
        title="Trending This Week"
        seeAllHref="#"
        films={trending}
        loading={trendingLoading}
        error={trendingError}
        genreMap={genreMap}
      />

      <FilmRow
        title="New Releases"
        seeAllHref="#"
        films={newReleases}
        loading={newReleasesLoading}
        error={newReleasesError}
        genreMap={genreMap}
      />

      <FilmRow
        title={genreTitle}
        seeAllHref="#"
        films={genreFilms}
        loading={genreLoading}
        error={genreError}
        genreMap={genreMap}
      />
    </main>
  );
}
