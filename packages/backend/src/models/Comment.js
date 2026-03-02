import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
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
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

commentSchema.index({ reviewId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
