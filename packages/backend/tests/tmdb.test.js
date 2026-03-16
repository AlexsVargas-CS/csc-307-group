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
      .query({ query: "matrix" });

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
});
