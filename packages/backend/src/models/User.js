import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      default: null
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    profilePicture: {
      type: String
    },
    bio: {
      type: String
    },
    favoriteGenres: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre'
      }
    ],
    favoriteFilms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Film'
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('validate', function validateProvider(next) {
  if (this.authProvider === 'local' && !this.passwordHash) {
    this.invalidate('passwordHash', 'passwordHash is required for local auth users.');
  }

  if (this.authProvider === 'google' && !this.googleId) {
    this.invalidate('googleId', 'googleId is required for google auth users.');
  }

  next();
});

const User = mongoose.model('User', userSchema);

export default User;