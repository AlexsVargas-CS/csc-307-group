import mongoose from 'mongoose';

const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      unique: true
    },
    acting: {
      type: Number,
      min: 0,
      max: 10
    },
    cinematography: {
      type: Number,
      min: 0,
      max: 10
    },
    soundtrack: {
      type: Number,
      min: 0,
      max: 10
    },
    soundDesign: {
      type: Number,
      min: 0,
      max: 10
    },
    artDirection: {
      type: Number,
      min: 0,
      max: 10
    },
    writing: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  { timestamps: true }
);

ratingSchema.pre('validate', function validateDimensions(next) {
  const values = [
    this.acting,
    this.cinematography,
    this.soundtrack,
    this.soundDesign,
    this.artDirection,
    this.writing
  ];

  const hasValue = values.some((value) => value !== undefined && value !== null);
  if (!hasValue) {
    this.invalidate('acting', 'At least one rating dimension must be provided.');
  }

  next();
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;