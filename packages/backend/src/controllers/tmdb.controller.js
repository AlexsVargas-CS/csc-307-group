import { z } from 'zod';

import Film from '../models/Film.js';
import Genre from '../models/Genre.js';
import { tmdbRequest } from '../services/tmdbClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

const searchSchema = z.object({
  query: z.string().trim().min(1),
  type: z.enum(['movie', 'tv']).default('movie'),
  page: z.coerce.number().int().positive().max(1000).default(1)
});

const detailsSchema = z.object({
  type: z.enum(['movie', 'tv']),
  tmdbId: z.coerce.number().int().positive()
});

const getTitle = (type, payload) => (type === 'movie' ? payload.title : payload.name);
const getReleaseDate = (type, payload) =>
  type === 'movie' ? payload.release_date || null : payload.first_air_date || null;

export const searchTmdb = asyncHandler(async (req, res) => {
  const { query, type, page } = searchSchema.parse(req.query);
  const searchPath = type === 'movie' ? '/search/movie' : '/search/tv';

  const data = await tmdbRequest(searchPath, { query, page });

  const results = (data.results || []).map((item) => ({
    tmdbId: item.id,
    type,
    title: getTitle(type, item),
    description: item.overview || '',
    releaseDate: getReleaseDate(type, item),
    posterPath: item.poster_path || null
  }));

  res.status(200).json({
    page: data.page || page,
    totalResults: data.total_results || results.length,
    totalPages: data.total_pages || 1,
    results
  });
});

export const getTmdbDetails = asyncHandler(async (req, res) => {
  const { type, tmdbId } = detailsSchema.parse(req.params);

  const [details, credits] = await Promise.all([
    tmdbRequest(`/${type}/${tmdbId}`),
    tmdbRequest(`/${type}/${tmdbId}/credits`)
  ]);

  const genreDocs = await Genre.find({ tmdbId: { $in: details.genres?.map((genre) => genre.id) || [] } });
  const director =
    credits.crew?.find((member) => member.job === 'Director')?.name ||
    credits.crew?.find((member) => member.job === 'Series Director')?.name ||
    null;

  const payload = {
    tmdbId,
    type,
    title: getTitle(type, details) || `TMDB ${type} ${tmdbId}`,
    description: details.overview || '',
    releaseYear: Number.parseInt((getReleaseDate(type, details) || '').slice(0, 4), 10) || null,
    genreIds: genreDocs.map((genre) => genre._id),
    director,
    cast: (credits.cast || []).slice(0, 10).map((member) => member.name),
    posterURL: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null
  };

  const film = await Film.findOneAndUpdate({ tmdbId, type }, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
    runValidators: true
  });

  if (!film) {
    throw new ApiError('Failed to persist film', 'FILM_UPSERT_FAILED', 500);
  }

  res.status(200).json({
    item: {
      tmdbId,
      type,
      title: payload.title,
      description: payload.description,
      releaseDate: getReleaseDate(type, details),
      genres: details.genres || [],
      posterPath: details.poster_path || null,
      credits: {
        cast: credits.cast || [],
        crew: credits.crew || []
      }
    }
  });
});