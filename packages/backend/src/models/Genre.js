import mongoose from 'mongoose';

const { Schema } = mongoose;

const genreSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    tmdbId: {
      type: Number,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

const Genre = mongoose.model('Genre', genreSchema);

export default Genre;
