import { z } from "zod";

import Film from "../models/Film.js";
import User from "../models/User.js";
import { CATEGORIES } from "../models/Rating.js";
import {
  upsertRating,
  deleteRating as deleteRatingSvc,
  getRatingsByFilm,
  getUserRatingForFilm,
  getDimensionAverages,
  getFilms as getFilmsSvc,
} from "../services/ratingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const categoryRatingSchema = z.object({
  category: z.enum(CATEGORIES),
  score: z.number().int().min(1).max(5),
});

const rateFilmBodySchema = z.object({
  score: z.number().int().min(1).max(5),
  reviewText: z.string().max(5000).optional().default(""),
  categoryRatings: z
    .array(categoryRatingSchema)
    .optional()
    .default([])
    .refine(
      (arr) =>
        new Set(arr.map((c) => c.category))
          .size === arr.length,
      {
        message:
          "Duplicate categories are not allowed",
      }
    ),
});

const filmListSchema = z.object({
  genre: objectIdSchema.optional(),
  sortBy: z
    .enum(["avgRating", "releaseYear", "title"])
    .default("avgRating"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .default(20),
});

const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .default(20),
});

async function resolveUserId(username) {
  const user = await User.findOne({
    username,
  }).select("_id");
  if (!user) {
    throw new ApiError(
      "User not found",
      "USER_NOT_FOUND",
      404
    );
  }
  return user._id;
}

export const rateFilm = asyncHandler(
  async (req, res) => {
    const filmId = objectIdSchema.parse(
      req.params.filmId
    );
    const { score, reviewText, categoryRatings } =
      rateFilmBodySchema.parse(req.body);
    const userId = await resolveUserId(
      req.user.username
    );

    const rating = await upsertRating(
      userId,
      filmId,
      score,
      categoryRatings,
      reviewText
    );

    res.status(200).json({ rating });
  }
);

export const removeRating = asyncHandler(
  async (req, res) => {
    const filmId = objectIdSchema.parse(
      req.params.filmId
    );
    const userId = await resolveUserId(
      req.user.username
    );

    await deleteRatingSvc(userId, filmId);
    res.status(200).json({ message: "Rating deleted" });
  }
);

export const getFilmRatings = asyncHandler(
  async (req, res) => {
    const filmId = objectIdSchema.parse(
      req.params.filmId
    );
    const { page, limit } = paginationSchema.parse(
      req.query
    );

    const result = await getRatingsByFilm(filmId, {
      page,
      limit,
    });

    res.status(200).json(result);
  }
);

export const getMyRating = asyncHandler(
  async (req, res) => {
    const filmId = objectIdSchema.parse(
      req.params.filmId
    );
    const userId = await resolveUserId(
      req.user.username
    );

    const rating = await getUserRatingForFilm(
      userId,
      filmId
    );

    res.status(200).json({ rating });
  }
);

export const getFilmDimensions = asyncHandler(
  async (req, res) => {
    const filmId = objectIdSchema.parse(
      req.params.filmId
    );
    const dimensions =
      await getDimensionAverages(filmId);
    res.status(200).json({ dimensions });
  }
);

const lookupSchema = z.object({
  tmdbId: z.coerce.number().int().positive(),
  type: z
    .enum(["movie", "tv"])
    .default("movie"),
});

export const lookupFilm = asyncHandler(
  async (req, res) => {
    const { tmdbId, type } = lookupSchema.parse(
      req.query
    );
    const film = await Film.findOne({
      tmdbId,
      type,
    }).lean();
    if (!film) {
      throw new ApiError(
        "Film not found",
        "FILM_NOT_FOUND",
        404
      );
    }
    res.status(200).json({ film });
  }
);

export const listFilms = asyncHandler(
  async (req, res) => {
    const params = filmListSchema.parse(req.query);
    const result = await getFilmsSvc(params);
    res.status(200).json(result);
  }
);
