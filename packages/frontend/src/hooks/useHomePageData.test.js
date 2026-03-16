import { describe, expect, test } from "@jest/globals";
import {
  buildCategorySpotlights,
  buildCuratedLists,
  buildMostDiscussed,
  buildPulseCards,
  dedup,
  getInitialHomePageData,
  loadHomePageData,
  normalize,
  pickHero,
} from "./useHomePageData.js";
import { posterURL } from "../api/tmdb.js";

function film(overrides = {}) {
  const has = (key) =>
    Object.prototype.hasOwnProperty.call(overrides, key);

  return {
    tmdbId: has("tmdbId") ? overrides.tmdbId : 1,
    title: has("title")
      ? overrides.title
      : "Sample Film",
    type: has("type") ? overrides.type : "movie",
    posterPath: has("posterPath")
      ? overrides.posterPath
      : "/poster.jpg",
    backdropPath: has("backdropPath")
      ? overrides.backdropPath
      : "/backdrop.jpg",
    overview: has("overview")
      ? overrides.overview
      : "A long enough overview to satisfy hero and pulse card requirements for the homepage.",
    genreIds: has("genreIds")
      ? overrides.genreIds
      : [18],
    voteAverage: has("voteAverage")
      ? overrides.voteAverage
      : 7.5,
    voteCount: has("voteCount")
      ? overrides.voteCount
      : 150,
    popularity: has("popularity")
      ? overrides.popularity
      : 100,
    releaseDate: has("releaseDate")
      ? overrides.releaseDate
      : "2026-03-16",
  };
}

describe("pickHero", () => {
  test("prefers a strong movie candidate", () => {
    const weakMovie = film({
      tmdbId: 1,
      title: "Weak",
      overview: "Too short",
    });
    const strongTv = film({
      tmdbId: 2,
      title: "Strong Show",
      type: "tv",
    });
    const strongMovie = film({
      tmdbId: 3,
      title: "Strong Movie",
    });

    expect(
      pickHero([weakMovie, strongTv, strongMovie]),
    ).toEqual(strongMovie);
  });

  test("falls back to secondary pool and returns null when empty", () => {
    const fallback = film({ tmdbId: 9, title: "Fallback" });

    expect(pickHero([], [fallback])).toEqual(fallback);
    expect(pickHero([], [])).toBeNull();
  });
});

describe("normalize", () => {
  test("normalizes title, release date, and default type", () => {
    expect(
      normalize({
        tmdbId: 1,
        name: "TV Title",
        first_air_date: "2025-05-01",
      }),
    ).toMatchObject({
      title: "TV Title",
      releaseDate: "2025-05-01",
      type: "movie",
    });
  });

  test("prefers existing title, releaseDate, and type values", () => {
    expect(
      normalize({
        tmdbId: 2,
        title: "Movie Title",
        name: "Ignored",
        releaseDate: "2026-01-01",
        release_date: "2025-01-01",
        type: "tv",
      }),
    ).toMatchObject({
      title: "Movie Title",
      releaseDate: "2026-01-01",
      type: "tv",
    });
  });

  test("uses null releaseDate when no date fields exist", () => {
    expect(
      normalize({
        tmdbId: 3,
        title: "No Date",
      }),
    ).toMatchObject({
      releaseDate: null,
    });
  });
});

describe("dedup", () => {
  test("keeps the first item per type and tmdbId pair", () => {
    const results = dedup([
      film({ tmdbId: 1, title: "Movie First", type: "movie" }),
      film({ tmdbId: 1, title: "Movie Second", type: "movie" }),
      film({ tmdbId: 1, title: "TV Version", type: "tv" }),
    ]);

    expect(results.map((item) => item.title)).toEqual([
      "Movie First",
      "TV Version",
    ]);
  });
});

describe("buildCategorySpotlights", () => {
  test("matches category genres and avoids reusing the same film", () => {
    const pool = [
      film({ tmdbId: 1, title: "Drama Pick", genreIds: [18] }),
      film({
        tmdbId: 2,
        title: "Sci-Fi Pick",
        genreIds: [878],
      }),
      film({
        tmdbId: 3,
        title: "Music Pick",
        genreIds: [10402],
      }),
      film({
        tmdbId: 4,
        title: "Thriller Pick",
        genreIds: [53],
      }),
      film({
        tmdbId: 5,
        title: "Fantasy Pick",
        genreIds: [14],
      }),
      film({
        tmdbId: 6,
        title: "Mystery Pick",
        genreIds: [9648],
      }),
    ];

    const spotlights = buildCategorySpotlights(pool);

    expect(spotlights).toHaveLength(6);
    expect(spotlights.map((item) => item.film.tmdbId)).toEqual(
      [1, 2, 3, 4, 5, 6],
    );
  });

  test("uses poster-backed fallbacks when genre matches are missing", () => {
    const pool = [
      film({ tmdbId: 11, title: "Fallback One", genreIds: [] }),
      film({ tmdbId: 12, title: "Fallback Two", genreIds: [] }),
    ];

    const spotlights = buildCategorySpotlights(pool);

    expect(spotlights).toHaveLength(2);
    expect(spotlights[0].film.tmdbId).toBe(11);
    expect(spotlights[1].film.tmdbId).toBe(12);
  });
});

describe("buildMostDiscussed", () => {
  test("sorts by popularity and ignores unrated or posterless items", () => {
    const results = buildMostDiscussed([
      film({ tmdbId: 1, popularity: 75 }),
      film({ tmdbId: 2, popularity: 250 }),
      film({
        tmdbId: 3,
        popularity: 500,
        voteCount: 0,
      }),
      film({
        tmdbId: 4,
        popularity: 450,
        posterPath: null,
      }),
    ]);

    expect(results.map((item) => item.tmdbId)).toEqual([2, 1]);
  });
});

describe("buildPulseCards", () => {
  test("keeps only entries with posters and long overviews", () => {
    const results = buildPulseCards([
      film({ tmdbId: 1 }),
      film({
        tmdbId: 2,
        overview: "Short overview",
      }),
      film({
        tmdbId: 3,
        posterPath: null,
      }),
      film({ tmdbId: 4 }),
    ]);

    expect(results.map((item) => item.tmdbId)).toEqual([1, 4]);
  });
});

describe("buildCuratedLists", () => {
  test("returns only lists with at least two matching films", () => {
    const pool = [
      film({
        tmdbId: 1,
        title: "Drama One",
        genreIds: [18],
        voteAverage: 8,
      }),
      film({
        tmdbId: 2,
        title: "Drama Two",
        genreIds: [18],
        voteAverage: 7.2,
      }),
      film({
        tmdbId: 3,
        title: "Fantasy One",
        genreIds: [14],
        voteAverage: 7.8,
      }),
      film({
        tmdbId: 4,
        title: "Sci-Fi One",
        genreIds: [878],
        voteAverage: 7.4,
      }),
      film({
        tmdbId: 5,
        title: "Hidden Gem One",
        genreIds: [35],
        voteAverage: 6.8,
        popularity: 50,
      }),
      film({
        tmdbId: 6,
        title: "Hidden Gem Two",
        genreIds: [80],
        voteAverage: 6.9,
        popularity: 80,
      }),
    ];

    const lists = buildCuratedLists(pool);

    expect(lists.map((list) => list.title)).toEqual([
      "Award Season Spotlight",
      "Visually Stunning",
      "Hidden Gems",
    ]);
    expect(lists[0].films).toHaveLength(2);
    expect(lists[1].films).toHaveLength(2);
    expect(lists[2].films).toHaveLength(2);
  });
});

describe("home page data loading", () => {
  test("provides the expected initial state shape", () => {
    expect(getInitialHomePageData()).toEqual({
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
    });
  });

  test("builds homepage sections from successful API responses", async () => {
    const now = new Date("2026-03-16T00:00:00.000Z");
    const genreMap = new Map([
      [18, "Drama"],
      [878, "Sci-Fi"],
    ]);
    const trending = [
      {
        tmdbId: 1,
        name: "Trend One",
        posterPath: "/trend-1.jpg",
        backdropPath: "/trend-backdrop-1.jpg",
        first_air_date: "2026-02-01",
        overview:
          "This trending title has a long enough overview to become the homepage hero card right away.",
        genreIds: [18],
        voteAverage: 8.1,
        voteCount: 210,
        popularity: 120,
      },
      {
        tmdbId: 2,
        title: "Trend Two",
        type: "movie",
        posterPath: "/trend-2.jpg",
        backdropPath: "/trend-backdrop-2.jpg",
        release_date: "2026-02-10",
        overview:
          "Another trending entry with a long overview to qualify for pulse cards and curation lists.",
        genreIds: [878],
        voteAverage: 7.7,
        voteCount: 175,
        popularity: 180,
      },
      {
        tmdbId: 2,
        title: "Trend Two Duplicate",
        type: "movie",
        posterPath: "/trend-2-dup.jpg",
        backdropPath: "/trend-backdrop-2-dup.jpg",
        release_date: "2026-02-10",
        overview:
          "Duplicate entry that should be removed once the combined pool is deduplicated for derived sections.",
        genreIds: [878],
        voteAverage: 7.7,
        voteCount: 175,
        popularity: 181,
      },
    ];
    const nowPlaying = [
      {
        tmdbId: 3,
        title: "Now Playing",
        type: "movie",
        posterPath: "/now.jpg",
        backdropPath: "/now-backdrop.jpg",
        release_date: "2026-03-10",
        overview:
          "A now playing film with enough detail to contribute to the homepage sections and pulse cards.",
        genreIds: [18],
        voteAverage: 7.4,
        voteCount: 150,
        popularity: 95,
      },
    ];
    const upcoming = [
      {
        tmdbId: 4,
        title: "Upcoming Good",
        type: "movie",
        posterPath: "/upcoming.jpg",
        release_date: "2026-04-01",
        overview: "Upcoming film",
      },
      {
        tmdbId: 5,
        title: "Upcoming No Poster",
        type: "movie",
        posterPath: null,
        release_date: "2026-04-02",
        overview: "Should be filtered out",
      },
      {
        tmdbId: 6,
        title: "Already Released",
        type: "movie",
        posterPath: "/past.jpg",
        release_date: "2026-03-01",
        overview: "Should be filtered out",
      },
    ];

    const result = await loadHomePageData({
      fetchTrendingFn: async (timeWindow) => {
        expect(timeWindow).toBe("week");
        return trending;
      },
      fetchNewReleasesFn: async () => nowPlaying,
      fetchGenresFn: async () => genreMap,
      fetchDiscoverFn: async (params) => {
        expect(params).toEqual({
          sort_by: "popularity.desc",
          "primary_release_date.gte": "2026-03-16",
          "primary_release_date.lte": "2026-06-14",
        });
        return upcoming;
      },
      now,
    });

    expect(result.loading).toBe(false);
    expect(result.error).toBe(false);
    expect(result.hero?.title).toBe("Trend One");
    expect(result.genreMap).toBe(genreMap);
    expect(result.trending).toHaveLength(3);
    expect(result.trending[0]).toMatchObject({
      title: "Trend One",
      releaseDate: "2026-02-01",
      type: "movie",
    });
    expect(result.nowPlaying[0]).toMatchObject({
      title: "Now Playing",
      releaseDate: "2026-03-10",
    });
    expect(result.upcoming.map((item) => item.tmdbId)).toEqual([4]);
    expect(result.categorySpotlights.length).toBeGreaterThan(0);
    expect(result.mostDiscussed.map((item) => item.tmdbId)).toEqual([
      2,
      1,
      3,
    ]);
    expect(result.pulseCards.map((item) => item.tmdbId)).toEqual([
      1,
      2,
      3,
    ]);
    expect(
      result.curatedLists.map((list) => list.title),
    ).toEqual(["Award Season Spotlight"]);
  });

  test("falls back gracefully when some API calls fail", async () => {
    const result = await loadHomePageData({
      fetchTrendingFn: async () => {
        throw new Error("trending failed");
      },
      fetchNewReleasesFn: async () => [
        {
          tmdbId: 10,
          title: "Resilient Film",
          type: "movie",
          posterPath: "/film.jpg",
          backdropPath: "/backdrop.jpg",
          release_date: "2026-03-05",
          overview:
            "Still enough data to produce a fallback hero and preserve the successful requests.",
          genreIds: [18],
          voteAverage: 7.8,
          voteCount: 99,
          popularity: 88,
        },
      ],
      fetchGenresFn: async () => new Map([[18, "Drama"]]),
      fetchDiscoverFn: async () => {
        throw new Error("discover failed");
      },
      now: new Date("2026-03-16T00:00:00.000Z"),
    });

    expect(result.error).toBe(false);
    expect(result.hero?.title).toBe("Resilient Film");
    expect(result.trending).toEqual([]);
    expect(result.nowPlaying).toHaveLength(1);
    expect(result.upcoming).toEqual([]);
  });

  test("returns an error state when processing the data fails", async () => {
    const result = await loadHomePageData({
      fetchTrendingFn: async () => ({}),
      fetchNewReleasesFn: async () => [],
      fetchGenresFn: async () => new Map(),
      fetchDiscoverFn: async () => [],
      now: new Date("2026-03-16T00:00:00.000Z"),
    });

    expect(result).toEqual({
      ...getInitialHomePageData(),
      loading: false,
      error: true,
    });
  });
});

describe("posterURL", () => {
  test("builds a TMDB image URL and handles empty paths", () => {
    expect(posterURL("/poster.png")).toBe(
      "https://image.tmdb.org/t/p/w500/poster.png",
    );
    expect(posterURL("/poster.png", "original")).toBe(
      "https://image.tmdb.org/t/p/original/poster.png",
    );
    expect(posterURL(null)).toBeNull();
  });
});
