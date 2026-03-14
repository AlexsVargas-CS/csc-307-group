import { Router } from 'express';

import {
  discoverMovies,
  getGenres,
  getNowPlaying,
  getTmdbDetails,
  getTrending,
  searchTmdb
} from '../controllers/tmdb.controller.js';

const router = Router();

router.get('/search', searchTmdb);
router.get('/genres', getGenres);
router.get('/now-playing', getNowPlaying);
router.get('/discover', discoverMovies);
router.get('/trending/:timeWindow', getTrending);
router.get('/:type/:tmdbId', getTmdbDetails);

export default router;
