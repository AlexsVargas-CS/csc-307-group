import nock from 'nock';
import request from 'supertest';

import app from '../src/app.js';
import Film from '../src/models/Film.js';

describe('TMDB routes', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('/api/tmdb/search returns expected shape', async () => {
    nock('https://api.themoviedb.org')
      .get('/3/search/movie')
      .query(true)
      .reply(200, {
        page: 1,
        total_results: 1,
        total_pages: 1,
        results: [
          {
            id: 550,
            title: 'Fight Club',
            overview: 'An insomniac office worker...',
            release_date: '1999-10-15',
            poster_path: '/a.jpg'
          }
        ]
      });

    const response = await request(app).get('/api/tmdb/search').query({ query: 'Fight Club' });

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0]).toMatchObject({
      tmdbId: 550,
      type: 'movie',
      title: 'Fight Club'
    });
  });

  it('/api/tmdb/:type/:tmdbId returns shape and upserts Film', async () => {
    nock('https://api.themoviedb.org')
      .get('/3/movie/550')
      .query(true)
      .reply(200, {
        id: 550,
        title: 'Fight Club',
        overview: 'An insomniac office worker...',
        release_date: '1999-10-15',
        poster_path: '/a.jpg',
        genres: [{ id: 18, name: 'Drama' }]
      });

    nock('https://api.themoviedb.org')
      .get('/3/movie/550/credits')
      .query(true)
      .reply(200, {
        cast: [{ name: 'Edward Norton' }, { name: 'Brad Pitt' }],
        crew: [{ job: 'Director', name: 'David Fincher' }]
      });

    const response = await request(app).get('/api/tmdb/movie/550');

    expect(response.status).toBe(200);
    expect(response.body.item).toMatchObject({
      tmdbId: 550,
      type: 'movie',
      title: 'Fight Club'
    });

    const film = await Film.findOne({ tmdbId: 550, type: 'movie' });
    expect(film).toBeTruthy();
    expect(film.title).toBe('Fight Club');
  });
});
