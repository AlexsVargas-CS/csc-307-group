import { Router } from 'express';

import { getTmdbDetails, searchTmdb } from '../controllers/tmdb.controller.js';

const router = Router();

router.get('/search', searchTmdb);
router.get('/:type/:tmdbId', getTmdbDetails);

export default router;
