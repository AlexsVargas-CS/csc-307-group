import { Router } from 'express';

import tmdbRoutes from './tmdb.routes.js';
import usersRoutes from "./users.js";

const router = Router();

router.use('/tmdb', tmdbRoutes);
router.use(usersRoutes);

export default router;
