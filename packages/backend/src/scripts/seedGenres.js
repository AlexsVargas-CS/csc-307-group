import { connectToDatabase, disconnectFromDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import Genre from '../models/Genre.js';
import { tmdbRequest } from '../services/tmdbClient.js';

const mergeGenresById = (movieGenres, tvGenres) => {
  const byId = new Map();

  for (const genre of [...movieGenres, ...tvGenres]) {
    if (!byId.has(genre.id)) {
      byId.set(genre.id, { tmdbId: genre.id, name: genre.name });
    }
  }

  return [...byId.values()];
};

const seedGenres = async () => {
  await connectToDatabase(env.MONGODB_URI);

  const movieResponse = await tmdbRequest('/genre/movie/list');
  const tvResponse = await tmdbRequest('/genre/tv/list');

  const mergedGenres = mergeGenresById(movieResponse.genres || [], tvResponse.genres || []);

  let inserted = 0;
  let updated = 0;

  for (const genre of mergedGenres) {
    const existing = await Genre.findOne({ tmdbId: genre.tmdbId });

    if (!existing) {
      await Genre.create(genre);
      inserted += 1;
      continue;
    }

    if (existing.name !== genre.name) {
      existing.name = genre.name;
      await existing.save();
      updated += 1;
    }
  }

  console.log(
    `Genre seed complete. total=${mergedGenres.length} inserted=${inserted} updated=${updated}`
  );
  await disconnectFromDatabase();
};

seedGenres().catch(async (error) => {
  console.error('Failed to seed genres:', error);
  await disconnectFromDatabase();
  process.exit(1);
});
