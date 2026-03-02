import request from 'supertest';

import app from '../src/app.js';

describe('Health endpoint', () => {
  it('GET /health returns 200 and ok true', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
