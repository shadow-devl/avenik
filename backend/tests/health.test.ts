import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Health API', () => {
  it('should return 200 OK for /api/health', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('status', 'ok');
    expect(response.body.data).toHaveProperty('version');
  });
});
