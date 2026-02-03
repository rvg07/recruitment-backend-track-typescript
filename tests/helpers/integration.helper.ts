import request from 'supertest';
import app  from '../../src/app';
import {prisma } from '../setup';
import {userFixture } from '../fixtures/user.fixture';

export const getAuthToken = async () => {
  await prisma.user.deleteMany({ where: { email: userFixture.valid.email } });
  const user = await prisma.user.create({
    data: await userFixture.validHashed()
  });
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: userFixture.valid.email,
      password: userFixture.valid.password
    });
  return { 
    token: `Bearer ${response.body.token}`, 
    user 
  };
};