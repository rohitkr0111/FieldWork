import { describe, expect, it } from 'vitest';
import supertest from 'supertest';
import app from '../server.js';

describe('versioned API boundary', () => {
  it('rejects private dashboard access without a session', async () => {
    const response = await supertest(app).get('/api/v1/admin/dashboard');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
  });

  it('validates public enquiry details before database access', async () => {
    const response = await supertest(app).post('/api/v1/enquiries').send({
      name: 'Asha Rao', email: 'asha@example.in', phone: '1234', message: 'Need a new business website', contactConsent: true
    });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('applies bounded pagination before querying the public catalogue', async () => {
    const response = await supertest(app).get('/api/v1/projects?limit=1000');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
