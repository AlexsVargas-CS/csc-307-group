import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

const SALT_ROUNDS = 12;

export const toSafeUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  authProvider: user.authProvider
});

export const createToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const createLocalUser = async ({ username, email, password }) => {
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError('User already exists', 'CONFLICT', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    username,
    email,
    authProvider: 'local',
    passwordHash
  });

  return user;
};

export const authenticateLocalUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    throw new ApiError('Invalid email or password', 'UNAUTHORIZED', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError('Invalid email or password', 'UNAUTHORIZED', 401);
  }

  return user;
};

export const findOrCreateGoogleUser = async (profile) => {
  const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();
  const picture = profile.photos?.[0]?.value;

  if (!email) {
    throw new ApiError('Google profile does not include an email', 'GOOGLE_PROFILE_INVALID', 400);
  }

  const googleId = profile.id;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({
      username: profile.displayName || email.split('@')[0],
      email,
      authProvider: 'google',
      googleId,
      profilePicture: picture
    });
    return user;
  }

  user.authProvider = 'google';
  user.googleId = googleId;
  if (picture) {
    user.profilePicture = picture;
  }

  await user.save();
  return user;
};
