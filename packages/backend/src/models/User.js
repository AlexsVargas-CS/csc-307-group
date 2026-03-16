import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  bio: { type: String, default: "" },
  favoriteGenres: { type: [String], default: [] },
  profilePictureUrl: { type: String, default: "" },
  favoriteMovies: {
    type: [Number],
    default: [],
  }
});

export default mongoose.model("User", userSchema);