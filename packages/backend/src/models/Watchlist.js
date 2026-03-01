import mongoose from 'mongoose';

const { Schema } = mongoose;

const watchlistSchema = new Schema(
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
    status: {
      type: String,
      enum: ['want', 'watching', 'watched'],
      required: true
    }
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, filmId: 1 }, { unique: true });
watchlistSchema.index({ userId: 1, status: 1 });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;