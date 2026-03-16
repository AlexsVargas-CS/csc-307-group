import mongoose from "mongoose";

import Film from "../models/Film.js";
import Rating from "../models/Rating.js";
import { ApiError } from "../utils/apiError.js";

export const upsertRating = async (
  userId,
  filmId,
  score,
  categoryRatings = [],
  reviewText = ""
) => {
  const film = await Film.findById(filmId);
  if (!film) {
    throw new ApiError(
      "Film not found",
      "FILM_NOT_FOUND",
      404
    );
  }

  const rating = await Rating.findOneAndUpdate(
    { userId, filmId },
    { score, categoryRatings, reviewText },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  await Rating.recalcFilmAverage(
    new mongoose.Types.ObjectId(filmId)
  );
  return rating;
};

export const deleteRating = async (
  userId,
  filmId
) => {
  const rating = await Rating.findOneAndDelete({
    userId,
    filmId,
  });
  if (!rating) {
    throw new ApiError(
      "Rating not found",
      "RATING_NOT_FOUND",
      404
    );
  }

  await Rating.recalcFilmAverage(
    new mongoose.Types.ObjectId(filmId)
  );
  return rating;
};

export const getRatingsByFilm = async (
  filmId,
  { page = 1, limit = 20 }
) => {
  const skip = (page - 1) * limit;
  const [ratings, total] = await Promise.all([
    Rating.find({ filmId })
      .populate("userId", "username profilePictureUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Rating.countDocuments({ filmId }),
  ]);

  return {
    ratings,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getUserRatingForFilm = async (
  userId,
  filmId
) => {
  return Rating.findOne({ userId, filmId }).lean();
};

export const getDimensionAverages = async (
  filmId
) => {
  return Rating.aggregateDimensions(
    new mongoose.Types.ObjectId(filmId)
  );
};

export const getFilms = async ({
  genre,
  sortBy = "avgRating",
  order = "desc",
  page = 1,
  limit = 20,
}) => {
  const filter = {};
  if (genre) {
    filter.genreIds = new mongoose.Types.ObjectId(
      genre
    );
  }

  const sortDir = order === "asc" ? 1 : -1;
  const sortField =
    {
      avgRating: "avgRating",
      releaseYear: "releaseYear",
      title: "title",
    }[sortBy] || "avgRating";

  const skip = (page - 1) * limit;

  const [films, total] = await Promise.all([
    Film.find(filter)
      .populate("genreIds", "name tmdbId")
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limit)
      .lean(),
    Film.countDocuments(filter),
  ]);

  return {
    films,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
};
