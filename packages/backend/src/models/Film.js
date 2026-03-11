import mongoose from 'mongoose';

const { Schema } = mongoose;

const filmSchema = new Schema(
  {
    tmdbId: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['movie', 'tv'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    releaseYear: {
      type: Number
    },
    genreIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre'
      }
    ],
    director: {
      type: String
    },
    cast: [
      {
        type: String
      }
    ],
    posterURL: {
      type: String
    }
  },
  { timestamps: true }
);

filmSchema.index({ tmdbId: 1, type: 1 }, { unique: true });
filmSchema.index({ title: 'text' });

const Film = mongoose.model('Film', filmSchema);

export default Film;
