import mongoose from 'mongoose';

const { Schema } = mongoose;

const reviewLikeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true
    }
  },
  { timestamps: true }
);

reviewLikeSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

const ReviewLike = mongoose.model('ReviewLike', reviewLikeSchema);

export default ReviewLike;