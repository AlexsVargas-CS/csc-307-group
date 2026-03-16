import { beforeEach, describe, expect, jest, test } from "@jest/globals";

async function loadTmdbModule() {
  return import(`./tmdb.js?test=${Date.now()}-${Math.random()}`);
}

function mockFetchResponse({ ok = true, jsonData = {} } = {}) {
  return {
    ok,
    json: jest.fn().mockResolvedValue(jsonData),
  };
}

describe("tmdb api helpers", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test("searchFilms calls the search endpoint with encoded params", async () => {
    const { searchFilms } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { results: [{ id: 1, title: "Alien" }] },
      }),
    );

    const result = await searchFilms("star wars", "tv");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/search?query=star+wars&type=tv",
    );
    expect(result).toEqual({
      results: [{ id: 1, title: "Alien" }],
    });
  });

  test("searchFilms throws when the request fails", async () => {
    const { searchFilms } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(searchFilms("bad query")).rejects.toThrow(
      "Search failed",
    );
  });

  test("getFilmDetails requests the correct detail endpoint", async () => {
    const { getFilmDetails } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { id: 42, title: "Arrival" },
      }),
    );

    const result = await getFilmDetails("movie", 42);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/movie/42",
    );
    expect(result).toEqual({ id: 42, title: "Arrival" });
  });

  test("getFilmDetails throws on a bad response", async () => {
    const { getFilmDetails } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(getFilmDetails("tv", 15)).rejects.toThrow(
      "Failed to load details",
    );
  });

  test("getSimilarFilms returns only the results array", async () => {
    const { getSimilarFilms } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { results: [{ id: 10 }, { id: 11 }] },
      }),
    );

    const result = await getSimilarFilms("movie", 12);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/movie/12/similar",
    );
    expect(result).toEqual([{ id: 10 }, { id: 11 }]);
  });

  test("getSimilarFilms throws on failure", async () => {
    const { getSimilarFilms } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(getSimilarFilms("movie", 12)).rejects.toThrow(
      "Failed to load similar films",
    );
  });

  test("fetchGenres caches the first successful response", async () => {
    const { fetchGenres } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: {
          genres: [
            { id: 28, name: "Action" },
            { id: 18, name: "Drama" },
          ],
        },
      }),
    );

    const first = await fetchGenres();
    const second = await fetchGenres();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(first.get(28)).toBe("Action");
    expect(first.get(18)).toBe("Drama");
  });

  test("fetchGenres throws on failure", async () => {
    const { fetchGenres } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(fetchGenres()).rejects.toThrow(
      "Failed to load genres",
    );
  });

  test("fetchTrending defaults to the week time window", async () => {
    const { fetchTrending } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { results: [{ id: 99 }] },
      }),
    );

    const result = await fetchTrending();

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/trending/week",
    );
    expect(result).toEqual([{ id: 99 }]);
  });

  test("fetchTrending throws on failure", async () => {
    const { fetchTrending } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(fetchTrending("day")).rejects.toThrow(
      "Failed to load trending",
    );
  });

  test("fetchNewReleases returns the results array", async () => {
    const { fetchNewReleases } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { results: [{ id: 5 }] },
      }),
    );

    const result = await fetchNewReleases();

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/now-playing",
    );
    expect(result).toEqual([{ id: 5 }]);
  });

  test("fetchNewReleases throws on failure", async () => {
    const { fetchNewReleases } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(fetchNewReleases()).rejects.toThrow(
      "Failed to load new releases",
    );
  });

  test("fetchByGenre passes the selected genre in the query string", async () => {
    const { fetchByGenre } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { results: [{ id: 7 }] },
      }),
    );

    const result = await fetchByGenre(878);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/discover?with_genres=878",
    );
    expect(result).toEqual([{ id: 7 }]);
  });

  test("fetchByGenre throws on failure", async () => {
    const { fetchByGenre } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(fetchByGenre(18)).rejects.toThrow(
      "Failed to load genre films",
    );
  });

  test("fetchDiscover builds a query string from params", async () => {
    const { fetchDiscover } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({
        jsonData: { results: [{ id: 77 }] },
      }),
    );

    const result = await fetchDiscover({
      sort_by: "popularity.desc",
      with_genres: "18",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tmdb/discover?sort_by=popularity.desc&with_genres=18",
    );
    expect(result).toEqual([{ id: 77 }]);
  });

  test("fetchDiscover throws on failure", async () => {
    const { fetchDiscover } = await loadTmdbModule();
    global.fetch.mockResolvedValue(
      mockFetchResponse({ ok: false }),
    );

    await expect(fetchDiscover()).rejects.toThrow(
      "Failed to load discover",
    );
  });
});
