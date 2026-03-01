import { z } from 'zod';

import {
  authenticateLocalUser,
  createLocalUser,
  createToken,
  toSafeUser
} from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  username: z.string().trim().min(3),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1)
});

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const user = await createLocalUser(input);
  const token = createToken(user);

  res.status(200).json({
    token,
    user: toSafeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await authenticateLocalUser(input);
  const token = createToken(user);

  res.status(200).json({
    token,
    user: toSafeUser(user)
  });
});

export const currentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ user: toSafeUser(req.user) });
});

export const googleAuthSuccess = asyncHandler(async (req, res) => {
  const token = createToken(req.user);
  const redirectUrl = new URL('/auth/callback', env.CLIENT_ORIGIN);
  redirectUrl.searchParams.set('token', token);
  res.redirect(302, redirectUrl.toString());
});
