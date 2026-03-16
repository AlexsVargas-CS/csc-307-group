import mongoose from "mongoose";

import Film from "./Film.js";

const { Schema } = mongoose;

const CATEGORIES = [
  "acting",
  "cinematography",
  "soundtrack",
  "soundDesign",
  "artDirection",
  "writing",
];

const ratingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filmId: {
      type: Schema.Types.ObjectId,
      ref: "Film",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      default: "",
    },
    categoryRatings: [
      {
        category: {
          type: String,
          enum: CATEGORIES,
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
  },
  { timestamps: true }
);

ratingSchema.index(
  { userId: 1, filmId: 1 },
  { unique: true }
);
ratingSchema.index({ filmId: 1 });

ratingSchema.statics.recalcFilmAverage =
  async function (filmId) {
    const [result] = await this.aggregate([
      { $match: { filmId } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
    ]);

    await Film.findByIdAndUpdate(filmId, {
      avgRating: result
        ? Math.round(result.avg * 10) / 10
        : 0,
      ratingCount: result ? result.count : 0,
    });
  };

ratingSchema.statics.aggregateDimensions = async function (filmId) {
  const results = await this.aggregate([
    { $match: { filmId } },
    { $unwind: "$categoryRatings" },
    {
      $group: {
        _id: "$categoryRatings.category",
        average: { $avg: "$categoryRatings.score" },
        count: { $sum: 1 },
      },
    },
  ]);

  const dimensions = {
    acting: { average: 0, count: 0 },
    cinematography: { average: 0, count: 0 },
    soundtrack: { average: 0, count: 0 },
    soundDesign: { average: 0, count: 0 },
    artDirection: { average: 0, count: 0 },
    writing: { average: 0, count: 0 },
  };

  for (const r of results) {
    dimensions[r._id] = {
      average: Math.round(r.average * 10) / 10,
      count: r.count,
    };
  }

  return dimensions;
};

export { CATEGORIES };
const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
