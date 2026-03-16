import { jest } from "@jest/globals";
import request from "supertest";

const tmdbRequestMock = jest.fn();
const FilmMock = {
  findOneAndUpdate: jest.fn(async () => ({ _id: "film1" })),
};
const GenreMock = {
  find: jest.fn(async () => [{ _id: "genre1", tmdbId: 28, name: "Action" }]),
};

jest.unstable_mockModule("../src/services/tmdbClient.js", () => ({
  tmdbRequest: tmdbRequestMock,
}));
jest.unstable_mockModule("../src/models/Film.js", () => ({
  default: FilmMock,
}));
jest.unstable_mockModule("../src/models/Genre.js", () => ({
  default: GenreMock,
}));

const { default: app } = await import("../src/app.js");

beforeEach(() => {
  tmdbRequestMock.mockReset();
  FilmMock.findOneAndUpdate.mockClear();
  GenreMock.find.mockClear();
});

describe("TMDB queries", () => {
  test("GET /api/tmdb/search validates query params", async () => {
    const res = await request(app).get("/api/tmdb/search");
    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe("VALIDATION_ERROR");
    expect(tmdbRequestMock).not.toHaveBeenCalled();
  });

  test("GET /api/tmdb/search maps results", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
        page: 1,
        total_results: 1,
        total_pages: 1,
        results: [
          {
            id: 603,
            title: "The Matrix",
            overview: "A computer hacker learns...",
            release_date: "1999-03-31",
            poster_path: "/poster.jpg",
          },
        ],
      });

    const res = await request(app)
      .get("/api/tmdb/search")
      .query({ query: "matrix", type: "movie" });

    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([
      {
        tmdbId: 603,
        type: "movie",
        title: "The Matrix",
        description: "A computer hacker learns...",
        releaseDate: "1999-03-31",
        posterPath: "/poster.jpg",
      },
    ]);
    expect(tmdbRequestMock).toHaveBeenCalledWith("/search/movie", {
      query: "matrix",
      page: 1,
    });
  });

  test("GET /api/tmdb/search defaults to multi and filters out person results", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      page: 1,
      total_results: 3,
      total_pages: 1,
      results: [
        {
          id: 1396,
          media_type: "tv",
          name: "Breaking Bad",
          overview: "A chemistry teacher...",
          first_air_date: "2008-01-20",
          poster_path: "/bb.jpg",
        },
        {
          id: 603,
          media_type: "movie",
          title: "The Matrix",
          overview: "A computer hacker learns...",
          release_date: "1999-03-31",
          poster_path: "/matrix.jpg",
        },
        {
          id: 999,
          media_type: "person",
          name: "Some Person",
        },
      ],
    });

    const res = await request(app)
      .get("/api/tmdb/search")
      .query({ query: "breaking" });

    expect(res.status).toBe(200);
    expect(tmdbRequestMock).toHaveBeenCalledWith(
      "/search/multi",
      { query: "breaking", page: 1 },
    );
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0]).toEqual({
      tmdbId: 1396,
      type: "tv",
      title: "Breaking Bad",
      description: "A chemistry teacher...",
      releaseDate: "2008-01-20",
      posterPath: "/bb.jpg",
    });
    expect(res.body.results[1]).toEqual({
      tmdbId: 603,
      type: "movie",
      title: "The Matrix",
      description: "A computer hacker learns...",
      releaseDate: "1999-03-31",
      posterPath: "/matrix.jpg",
    });
  });

  test("GET /api/tmdb/search supports tv results and fallback paging metadata", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      results: [
        {
          id: 10,
          name: "Severance",
          overview: "",
          first_air_date: "2022-02-18",
          poster_path: null,
        },
      ],
    });

    const res = await request(app)
      .get("/api/tmdb/search")
      .query({ query: "severance", type: "tv", page: 3 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      page: 3,
      totalResults: 1,
      totalPages: 1,
      results: [
        {
          tmdbId: 10,
          type: "tv",
          title: "Severance",
          description: "",
          releaseDate: "2022-02-18",
          posterPath: null,
        },
      ],
    });
    expect(tmdbRequestMock).toHaveBeenCalledWith("/search/tv", {
      query: "severance",
      page: 3,
    });
  });

  test("GET /api/tmdb/trending/:timeWindow defaults invalid windows to week", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      results: [
        {
          id: 1,
          media_type: "tv",
          name: "Trending Show",
          poster_path: "/poster.jpg",
          backdrop_path: "/backdrop.jpg",
          overview: "buzz",
          vote_average: 8.4,
          vote_count: 55,
          popularity: 90,
          genre_ids: [18],
          first_air_date: "2025-01-01",
        },
      ],
    });

    const res = await request(app)
      .get("/api/tmdb/trending/month")
      .query({ page: 4 });

    expect(res.status).toBe(200);
    expect(tmdbRequestMock).toHaveBeenCalledWith(
      "/trending/all/week",
      { page: "4" },
    );
    expect(res.body.results).toEqual([
      {
        tmdbId: 1,
        type: "tv",
        title: "Trending Show",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        overview: "buzz",
        voteAverage: 8.4,
        voteCount: 55,
        popularity: 90,
        genreIds: [18],
        releaseDate: "2025-01-01",
      },
    ]);
  });

  test("GET /api/tmdb/now-playing maps movie listings", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      results: [
        {
          id: 2,
          title: "Now Playing Movie",
          poster_path: null,
          backdrop_path: "/bg.jpg",
          overview: "",
          vote_average: null,
          vote_count: undefined,
          popularity: undefined,
          genre_ids: undefined,
          release_date: null,
        },
      ],
    });

    const res = await request(app)
      .get("/api/tmdb/now-playing")
      .query({ page: 7 });

    expect(res.status).toBe(200);
    expect(tmdbRequestMock).toHaveBeenCalledWith(
      "/movie/now_playing",
      { page: "7" },
    );
    expect(res.body.results[0]).toEqual({
      tmdbId: 2,
      type: "movie",
      title: "Now Playing Movie",
      posterPath: null,
      backdropPath: "/bg.jpg",
      overview: "",
      voteAverage: null,
      voteCount: 0,
      popularity: 0,
      genreIds: [],
      releaseDate: null,
    });
  });

  test("GET /api/tmdb/discover forwards only allowed params", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      results: [
        {
          id: 3,
          title: "Discover Movie",
          poster_path: "/poster.jpg",
          backdrop_path: null,
          overview: "desc",
          vote_average: 7.5,
          vote_count: 10,
          popularity: 44,
          genre_ids: [28],
          release_date: "2024-04-05",
        },
      ],
    });

    const res = await request(app)
      .get("/api/tmdb/discover")
      .query({
        page: 9,
        with_genres: "28",
        sort_by: "popularity.desc",
        "primary_release_date.gte": "2024-01-01",
        "primary_release_date.lte": "2024-12-31",
        "vote_average.gte": "7",
        "vote_count.gte": "50",
        ignored: "nope",
      });

    expect(res.status).toBe(200);
    expect(tmdbRequestMock).toHaveBeenCalledWith(
      "/discover/movie",
      {
        page: "9",
        with_genres: "28",
        sort_by: "popularity.desc",
        "primary_release_date.gte": "2024-01-01",
        "primary_release_date.lte": "2024-12-31",
        "vote_average.gte": "7",
        "vote_count.gte": "50",
      },
    );
    expect(res.body.results).toHaveLength(1);
  });

  test("GET /api/tmdb/genres returns the TMDB genre list", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      genres: [{ id: 28, name: "Action" }],
    });

    const res = await request(app).get("/api/tmdb/genres");

    expect(res.status).toBe(200);
    expect(tmdbRequestMock).toHaveBeenCalledWith("/genre/movie/list");
    expect(res.body).toEqual({
      genres: [{ id: 28, name: "Action" }],
    });
  });

  test("GET /api/tmdb/:type/:tmdbId/similar limits similar results to 8", async () => {
    tmdbRequestMock.mockResolvedValueOnce({
      results: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Show ${i + 1}`,
        poster_path: i % 2 === 0 ? `/poster-${i + 1}.jpg` : null,
        first_air_date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      })),
    });

    const res = await request(app).get("/api/tmdb/tv/77/similar");

    expect(res.status).toBe(200);
    expect(tmdbRequestMock).toHaveBeenCalledWith("/tv/77/similar", {
      page: 1,
    });
    expect(res.body.results).toHaveLength(8);
    expect(res.body.results[0]).toEqual({
      tmdbId: 1,
      type: "tv",
      title: "Show 1",
      posterPath: "/poster-1.jpg",
      releaseDate: "2025-01-01",
    });
  });

  test("GET /api/tmdb/:type/:tmdbId upserts Film and returns details", async () => {
    const details = {
      id: 603,
      title: "The Matrix",
      overview: "A computer hacker learns...",
      release_date: "1999-03-31",
      genres: [{ id: 28, name: "Action" }],
      poster_path: "/poster.jpg",
    };
    const credits = {
      cast: [{ name: "Keanu Reeves" }],
      crew: [{ job: "Director", name: "Lana Wachowski" }],
    };
    tmdbRequestMock.mockImplementation(async (path) => {
      if (path === "/movie/603") return details;
      if (path === "/movie/603/credits") return credits;
      throw new Error(`Unexpected TMDB path: ${path}`);
    });

    const res = await request(app).get("/api/tmdb/movie/603");
    expect(res.status).toBe(200);
    expect(res.body.item.tmdbId).toBe(603);
    expect(res.body.item.type).toBe("movie");
    expect(res.body.item.title).toBe("The Matrix");
    expect(GenreMock.find).toHaveBeenCalledWith({ tmdbId: { $in: [28] } });
    expect(FilmMock.findOneAndUpdate).toHaveBeenCalledWith(
      { tmdbId: 603, type: "movie" },
      expect.objectContaining({
        tmdbId: 603,
        type: "movie",
        title: "The Matrix",
        director: "Lana Wachowski",
        genreIds: ["genre1"],
      }),
      expect.objectContaining({
        upsert: true,
        new: true,
      }),
    );
  });

  test("GET /api/tmdb/:type/:tmdbId supports tv payload fallbacks", async () => {
    GenreMock.find.mockResolvedValueOnce([]);
    FilmMock.findOneAndUpdate.mockResolvedValueOnce({ _id: "film-tv" });
    tmdbRequestMock.mockImplementation(async (path) => {
      if (path === "/tv/15") {
        return {
          id: 15,
          name: "TV Name",
          overview: "",
          first_air_date: "2020-06-01",
          genres: [],
          poster_path: null,
        };
      }
      if (path === "/tv/15/credits") {
        return {
          cast: [{ name: "Actor One" }],
          crew: [{ job: "Series Director", name: "Show Runner" }],
        };
      }
      throw new Error(`Unexpected TMDB path: ${path}`);
    });

    const res = await request(app).get("/api/tmdb/tv/15");

    expect(res.status).toBe(200);
    expect(FilmMock.findOneAndUpdate).toHaveBeenCalledWith(
      { tmdbId: 15, type: "tv" },
      expect.objectContaining({
        title: "TV Name",
        releaseYear: 2020,
        director: "Show Runner",
        posterURL: null,
      }),
      expect.any(Object),
    );
    expect(res.body.item.releaseDate).toBe("2020-06-01");
  });

  test("GET /api/tmdb/:type/:tmdbId returns 500 when film upsert fails", async () => {
    GenreMock.find.mockResolvedValueOnce([]);
    FilmMock.findOneAndUpdate.mockResolvedValueOnce(null);
    tmdbRequestMock.mockImplementation(async (path) => {
      if (path === "/movie/8") {
        return {
          id: 8,
          title: "Broken Save",
          overview: "",
          release_date: "2021-01-01",
          genres: [],
          poster_path: null,
        };
      }
      if (path === "/movie/8/credits") {
        return { cast: [], crew: [] };
      }
      throw new Error(`Unexpected TMDB path: ${path}`);
    });

    const res = await request(app).get("/api/tmdb/movie/8");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("FILM_UPSERT_FAILED");
  });
});
