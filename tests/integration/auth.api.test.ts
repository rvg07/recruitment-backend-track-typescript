import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';
import { userFixture } from '../fixtures/user.fixture';

describe('Auth API Integration', () => {
  
  beforeEach(async () => {
    await prisma.user.deleteMany({ 
        where: { email: userFixture.valid.email } 
    });
  });

  describe('POST /api/auth/register', () => {
    
    it('should register a new user successfully and return 200/201', async () => {

      const response = await request(app)
        .post('/api/auth/register')
        .send(userFixture.valid);

      expect(response.status).toBe(201); 
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userFixture.valid.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 409 if email already exists', async () => {
      await prisma.user.create({
        data: await userFixture.validHashed()
      });
      const response= await request(app)
        .post('/api/auth/register')
        .send(userFixture.valid);
      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    
    it('should login successfully with correct credentials', async () => {
      await prisma.user.create({
        data: await userFixture.validHashed()
      });
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userFixture.valid.email,
          password: userFixture.valid.password
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userFixture.valid.email);
    });

    it('should return 401 for wrong password', async () => {

      await prisma.user.create({
        data: await userFixture.validHashed()
      });
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userFixture.valid.email,
          password: 'WrongPassword123!'
        });
      expect(response.status).toBe(401);
    });

    it('should return 401/404 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user_not_valid@mail.com',
          password: 'notValidUser123!'
        });
        expect(response.status).toBe(401);
    });

  });
});