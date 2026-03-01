import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication required', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = jwt.verify(token, env.JWT_SECRET);
    const userId = payload.id || payload.sub;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError('Invalid token', 'UNAUTHORIZED', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError('Invalid token', 'UNAUTHORIZED', 401));
    }
    return next(error);
  }
};
