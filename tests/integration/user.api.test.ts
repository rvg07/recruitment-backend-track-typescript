import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { getAuthToken } from '../helpers/integration.helper';

describe('User API Integration', () => {
  
  describe('GET /api/users', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('should return list of users if authenticated', async () => {
      const {token}= await getAuthToken();
      const users= await request(app)
        .get('/api/users')
        .set('Authorization', token);

      expect(users.status).toBe(200);
    });
  });

});