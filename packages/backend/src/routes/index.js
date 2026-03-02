import { Router } from 'express';

import tmdbRoutes from './tmdb.routes.js';

const router = Router();

router.use('/tmdb', tmdbRoutes);

export default router;
