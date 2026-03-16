import { useState, useEffect, useRef } from "react";
import {
  fetchTrending,
  fetchNewReleases,
  fetchGenres,
  fetchDiscover,
} from "../api/tmdb.js";

/**
 * Normalizes a TMDB item so movie/TV fields
 * are consistent across the app.
 */
export function normalize(item) {
  return {
    ...item,
    title: item.title || item.name,
    releaseDate:
      item.releaseDate ||
      item.release_date ||
      item.first_air_date ||
      null,
    type: item.type || "movie",
  };
}

/**
 * Deduplicates an array of films by tmdbId,
 * keeping the first occurrence.
 */
export function dedup(films) {
  const seen = new Set();
  return films.filter((f) => {
    const key = `${f.type}-${f.tmdbId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Picks a strong hero candidate from a list.
 * Prefers movies with backdrop, poster, title,
 * and overview.
 */
export function pickHero(items, fallbackItems = []) {
  const pool = [...items, ...fallbackItems];
  return (
    pool.find(
      (m) =>
        m.backdropPath &&
        m.posterPath &&
        m.title &&
        m.overview &&
        m.overview.length > 40 &&
        m.type === "movie",
    ) ||
    pool.find(
      (m) =>
        m.backdropPath &&
        m.posterPath &&
        m.title &&
        m.overview &&
        m.overview.length > 20,
    ) ||
    pool[0] ||
    null
  );
}

// TMDB genre IDs used for category matching
const GENRE_MAP = {
  drama: [18],
  scifi: [878],
  action: [28],
  thriller: [53],
  fantasy: [14],
  animation: [16],
  history: [36],
  mystery: [9648],
  music: [10402],
  war: [10752],
};

/**
 * Selects one representative title per Showme
 * dimension category from a pool of films.
 */
export function buildCategorySpotlights(pool) {
  const categories = [
    {
      name: "Acting",
      label: "Performance-driven picks",
      matchGenres: [...GENRE_MAP.drama],
    },
    {
      name: "Cinematography",
      label: "Visually striking picks",
      matchGenres: [
        ...GENRE_MAP.scifi,
        ...GENRE_MAP.war,
        ...GENRE_MAP.history,
      ],
    },
    {
      name: "Soundtrack",
      label: "Musically charged picks",
      matchGenres: [
        ...GENRE_MAP.music,
        ...GENRE_MAP.drama,
      ],
    },
    {
      name: "Sound Design",
      label: "Immersive audio picks",
      matchGenres: [
        ...GENRE_MAP.action,
        ...GENRE_MAP.thriller,
        ...GENRE_MAP.scifi,
      ],
    },
    {
      name: "Art Direction",
      label: "Stunning visual worlds",
      matchGenres: [
        ...GENRE_MAP.fantasy,
        ...GENRE_MAP.animation,
        ...GENRE_MAP.history,
      ],
    },
    {
      name: "Writing",
      label: "Critically acclaimed scripts",
      matchGenres: [
        ...GENRE_MAP.drama,
        ...GENRE_MAP.mystery,
      ],
    },
  ];

  const used = new Set();
  return categories
    .map((cat) => {
      const match = pool.find(
        (f) =>
          !used.has(f.tmdbId) &&
          f.posterPath &&
          f.genreIds?.some((id) =>
            cat.matchGenres.includes(id),
          ),
      );
      if (match) {
        used.add(match.tmdbId);
        return { ...cat, film: match };
      }
      // Fallback: pick any unused film with a poster
      const fallback = pool.find(
        (f) => !used.has(f.tmdbId) && f.posterPath,
      );
      if (fallback) {
        used.add(fallback.tmdbId);
        return { ...cat, film: fallback };
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Picks top discussed films by popularity proxy.
 */
export function buildMostDiscussed(pool, count = 5) {
  return [...pool]
    .filter((f) => f.posterPath && f.voteCount > 0)
    .sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0),
    )
    .slice(0, count);
}

/**
 * Builds "community pulse" cards from trending
 * films with good overviews.
 */
export function buildPulseCards(pool, count = 3) {
  return pool
    .filter(
      (f) =>
        f.posterPath &&
        f.overview &&
        f.overview.length > 60,
    )
    .slice(0, count);
}

/**
 * Builds curated list tiles from the pool.
 */
export function buildCuratedLists(pool) {
  const lists = [
    {
      title: "Award Season Spotlight",
      description:
        "Critically acclaimed films making waves",
      filter: (f) =>
        f.voteAverage >= 7 &&
        f.genreIds?.some((id) =>
          GENRE_MAP.drama.includes(id),
        ),
    },
    {
      title: "Visually Stunning",
      description:
        "Films that push cinematic boundaries",
      filter: (f) =>
        f.genreIds?.some((id) =>
          [
            ...GENRE_MAP.scifi,
            ...GENRE_MAP.fantasy,
          ].includes(id),
        ),
    },
    {
      title: "Hidden Gems",
      description:
        "Under-the-radar titles worth discovering",
      filter: (f) =>
        f.voteAverage >= 6.5 &&
        f.popularity < 100 &&
        f.posterPath,
    },
  ];

  return lists
    .map((list) => {
      const films = pool
        .filter(
          (f) => f.posterPath && list.filter(f),
        )
        .slice(0, 4);
      if (films.length < 2) return null;
      return {
        title: list.title,
        description: list.description,
        films,
      };
    })
    .filter(Boolean);
}

export function getInitialHomePageData() {
  return {
    loading: true,
    error: false,
    hero: null,
    genreMap: null,
    trending: [],
    nowPlaying: [],
    upcoming: [],
    categorySpotlights: [],
    mostDiscussed: [],
    pulseCards: [],
    curatedLists: [],
  };
}

export async function loadHomePageData({
  fetchTrendingFn = fetchTrending,
  fetchNewReleasesFn = fetchNewReleases,
  fetchGenresFn = fetchGenres,
  fetchDiscoverFn = fetchDiscover,
  now = new Date(),
} = {}) {
  try {
    // Build upcoming date range
    const today = now.toISOString().slice(0, 10);
    const futureDate = new Date(
      now.getTime() + 270 * 86400000,
    )
      .toISOString()
      .slice(0, 10);

    const [
      trending,
      nowPlaying,
      genres,
      upcoming,
    ] = await Promise.allSettled([
      fetchTrendingFn("week"),
      fetchNewReleasesFn(),
      fetchGenresFn(),
      fetchDiscoverFn({
        sort_by: "popularity.desc",
        "primary_release_date.gte": today,
        "primary_release_date.lte": futureDate,
      }),
    ]);

    const trendingList = (
      trending.status === "fulfilled"
        ? trending.value
        : []
    ).map(normalize);

    const nowPlayingList = (
      nowPlaying.status === "fulfilled"
        ? nowPlaying.value
        : []
    ).map(normalize);

    const upcomingList = (
      upcoming.status === "fulfilled"
        ? upcoming.value
        : []
    ).map(normalize);

    const genreMap =
      genres.status === "fulfilled"
        ? genres.value
        : null;

    const hero = pickHero(
      trendingList,
      nowPlayingList,
    );

    // Combined pool for derived sections
    const pool = dedup([
      ...trendingList,
      ...nowPlayingList,
    ]);

    return {
      loading: false,
      error: false,
      hero,
      genreMap,
      trending: trendingList.slice(0, 16),
      nowPlaying: nowPlayingList,
      upcoming: upcomingList
        .filter(
          (f) => f.posterPath && f.releaseDate > today,
        )
        .slice(0, 18),
      categorySpotlights:
        buildCategorySpotlights(pool),
      mostDiscussed: buildMostDiscussed(pool),
      pulseCards: buildPulseCards(pool),
      curatedLists: buildCuratedLists(pool),
    };
  } catch {
    return {
      ...getInitialHomePageData(),
      loading: false,
      error: true,
    };
  }
}

export default function useHomePageData() {
  const [data, setData] = useState(getInitialHomePageData);

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    loadHomePageData().then(setData);
  }, []);

  return data;
}
