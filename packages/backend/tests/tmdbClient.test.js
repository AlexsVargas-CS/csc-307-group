import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const getMock = jest.fn();
const createMock = jest.fn(() => ({ get: getMock }));

jest.unstable_mockModule("axios", () => ({
  default: {
    create: createMock,
  },
}));

const { tmdbRequest } = await import("../src/services/tmdbClient.js");
const { ApiError } = await import("../src/utils/apiError.js");

describe("tmdbRequest", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  test("sends the API key and returns response data", async () => {
    getMock.mockResolvedValue({
      data: { results: [{ id: 1 }] },
    });

    const result = await tmdbRequest("/search/movie", {
      query: "matrix",
      page: 2,
    });

    expect(getMock).toHaveBeenCalledWith("/search/movie", {
      params: {
        api_key: "test_tmdb_key",
        query: "matrix",
        page: 2,
      },
    });
    expect(result).toEqual({ results: [{ id: 1 }] });
  });

  test("wraps TMDB failures in an ApiError with response details", async () => {
    getMock.mockRejectedValue({
      response: {
        status: 404,
        data: { status_message: "Not found" },
      },
    });

    await expect(tmdbRequest("/movie/999")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Not found",
        code: "TMDB_REQUEST_FAILED",
        status: 404,
      }),
    );
  });

  test("uses default error details when TMDB gives no response payload", async () => {
    getMock.mockRejectedValue(new Error("socket hang up"));

    await expect(tmdbRequest("/movie/1")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "TMDB request failed",
        code: "TMDB_REQUEST_FAILED",
        status: 502,
      }),
    );
    await expect(tmdbRequest("/movie/1")).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
