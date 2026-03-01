import { Router } from 'express';

import authRoutes from './auth.routes.js';
import tmdbRoutes from './tmdb.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tmdb', tmdbRoutes);

export default router;