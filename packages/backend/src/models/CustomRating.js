import mongoose from 'mongoose';

const { Schema } = mongoose;

const customRatingSchema = new Schema(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true
    },
    dimensionName: {
      type: String,
      required: true,
      set: (value) => value.trim().toLowerCase()
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    }
  },
  { timestamps: true }
);

customRatingSchema.pre('validate', function normalizeDimension(next) {
  if (typeof this.dimensionName === 'string') {
    this.dimensionName = this.dimensionName.trim().toLowerCase();
  }
  next();
});

customRatingSchema.index({ reviewId: 1, dimensionName: 1 }, { unique: true });

const CustomRating = mongoose.model('CustomRating', customRatingSchema);

export default CustomRating;