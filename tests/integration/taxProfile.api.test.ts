import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';
import { getAuthToken } from '../helpers/integration.helper';
import { taxProfileFixture } from '../fixtures/taxProfile.fixture';

describe('TaxProfile API Integration', () => {

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.taxProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  
  describe('POST /api/tax-profiles', () => {
    
    it('should create a tax profile for the logged user', async () => {
      const {token, user} = await getAuthToken();
      const taxProfileFixtureWithUserId= taxProfileFixture.valid(user.id);

      const taxProfileRequestPost = await request(app)
        .post('/api/tax-profiles')
        .set('Authorization', token)
        .send(taxProfileFixtureWithUserId);

      expect(taxProfileRequestPost.status).toBe(201);
      expect(taxProfileRequestPost.body).toHaveProperty('id');
      expect(taxProfileRequestPost.body.companyName).toBe(taxProfileFixtureWithUserId.companyName);
      expect(taxProfileRequestPost.body.userId).toBe(user.id);
    });

    it('should return 400 if required fields are missing', async () => {
      const { token } = await getAuthToken();
      const taxProfileRequestPost = await request(app)
        .post('/api/tax-profiles')
        .set('Authorization', token)
        .send({
          address: "Address with missing fields"
        });
      expect(taxProfileRequestPost.status).toBe(400);
    });
  });

  describe('GET /api/tax-profiles', () => {
    it('should return a list of user profiles', async () => {
      const { token, user } = await getAuthToken();
      await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const taxProfileRequestGet = await request(app)
        .get('/api/tax-profiles')
        .set('Authorization', token);
      expect(taxProfileRequestGet.status).toBe(200);
      expect(taxProfileRequestGet.body.data[0].vatNumber).toBe(taxProfileFixture.valid(user.id).vatNumber);
    });
  });

  describe('PATCH /api/tax-profiles/:id', () => {
    it('should update own profile', async () => {
      const { token, user } = await getAuthToken();
      const actualTaxProfileDataWithUserId = taxProfileFixture.valid(user.id);
      const createTaxProfileData = await prisma.taxProfile.create({
        data: actualTaxProfileDataWithUserId as any
      });
      const toSPACompanyName = "ACME S.p.A.";
      const taxProfileRequestPatch = await request(app)
        .patch(`/api/tax-profiles/${createTaxProfileData.id}`)
        .set('Authorization', token)
        .send({
          companyName: toSPACompanyName
        });
      expect(taxProfileRequestPatch.status).toBe(200);
      expect(taxProfileRequestPatch.body.companyName).toBe(toSPACompanyName);
      expect(taxProfileRequestPatch.body.vatNumber).toBe(actualTaxProfileDataWithUserId.vatNumber);
    });

  });

  describe('DELETE /api/tax-profiles/:id', () => {
    it('should soft delete profile', async () => {
      const { token, user } = await getAuthToken();
      const taxProfileWithUserId = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const taxProfileRequestDelete = await request(app)
        .delete(`/api/tax-profiles/${taxProfileWithUserId.id}`)
        .set('Authorization', token);
      expect(taxProfileRequestDelete.status).toBe(204);
      const dbProfile = await prisma.taxProfile.findUnique({ 
        where: { id: taxProfileWithUserId.id }
      });
      expect(dbProfile?.deletedAt).not.toBeNull();
    });
  });

});