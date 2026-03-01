import request from 'supertest';

import app from '../src/app.js';

describe('Auth routes', () => {
  it('register returns token', async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Password123!'
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('alice@example.com');
  });

  it('login returns token', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'bob',
      email: 'bob@example.com',
      password: 'Password123!'
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'Password123!'
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.username).toBe('bob');
  });

  it('/api/auth/me returns current user with auth header', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      username: 'charlie',
      email: 'charlie@example.com',
      password: 'Password123!'
    });

    const token = registerResponse.body.token;

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe('charlie@example.com');
  });
});