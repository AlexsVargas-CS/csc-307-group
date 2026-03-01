import mongoose from 'mongoose';

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    filmId: {
      type: Schema.Types.ObjectId,
      ref: 'Film',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likeCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, filmId: 1 }, { unique: true });
reviewSchema.index({ filmId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;