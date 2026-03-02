import { Router } from 'express';
import passport from 'passport';

import { env } from '../config/env.js';
import { currentUser, googleAuthSuccess, login, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, currentUser);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/google/failure'
  }),
  googleAuthSuccess
);

router.get('/google/failure', (req, res) => {
  const redirectUrl = new URL('/auth/callback', env.CLIENT_ORIGIN);
  redirectUrl.searchParams.set('error', 'google_auth_failed');
  res.redirect(302, redirectUrl.toString());
});

export default router;
