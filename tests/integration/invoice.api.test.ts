import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';
import { getAuthToken } from '../helpers/integration.helper';
import { invoiceFixture } from '../fixtures/invoice.fixture';
import { taxProfileFixture } from '../fixtures/taxProfile.fixture';

describe('Invoice API Integration', () => {

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.taxProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/invoices', () => {
    it('should create an invoice linked to a tax profile', async () => {
      const {token, user} = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoiceData = invoiceFixture.valid(taxProfile.id);
      const invoiceRequestPost = await request(app)
        .post('/api/invoices')
        .set('Authorization', token)
        .send(invoiceData);

      expect(invoiceRequestPost.status).toBe(201);
      expect(invoiceRequestPost.body).toHaveProperty('id');
      expect(invoiceRequestPost.body.invoiceNumber).toBe(invoiceData.invoiceNumber);
      expect(Number(invoiceRequestPost.body.amount)).toBe(Number(invoiceData.amount));
      expect(invoiceRequestPost.body.taxProfileId).toBe(taxProfile.id);
    });

    it('should return 400 if validation fails', async () => {
      const {token} = await getAuthToken();
      const notValidValidationInvoice = await request(app)
        .post('/api/invoices')
        .set('Authorization', token)
        .send({
          description: "not valid insertion"
        });

      expect(notValidValidationInvoice.status).toBe(400);
    });
  });

  describe('GET /api/invoices', () => {
    it('should return list of invoices', async () => {
      const {token, user} = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoicesData = invoiceFixture.multiple(taxProfile.id);
      for (const invoice of invoicesData) {
        await prisma.invoice.create({ 
          data: { ...invoice } as any 
        });
      }
      const invoiceRequestGet = await request(app)
        .get('/api/invoices')
        .set('Authorization', token);
      expect(invoiceRequestGet.status).toBe(200);
      expect(invoiceRequestGet.body.data).toHaveLength(2);
      expect(invoiceRequestGet.body.data[0].invoiceNumber).toBe('INV-2026-003'); //for desceding order we've put
    });
  });

  describe('DELETE /api/invoices/:id soft deletiom', () => {
    it('should soft delete a PENDING invoice', async () => {
      const { token, user } = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoice = await prisma.invoice.create({
        data: { ...invoiceFixture.valid(taxProfile.id) } as any
      });
      const invoiceRequestDelete = await request(app)
        .delete(`/api/invoices/${invoice.id}`)
        .set('Authorization', token);
      expect(invoiceRequestDelete.status).toBe(204);
      const checkInvoiceFromDB = await prisma.invoice.findUnique({ where: { id: invoice.id }});
      expect(checkInvoiceFromDB?.deletedAt).not.toBeNull();
      expect(checkInvoiceFromDB?.status).toBe('PENDING');
    });
  });

  describe('DELETE /api/invoices/:id/permanent', () => {

    it('should hard delete a DRAFT invoice', async () => {
      const {token, user} = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoice = await prisma.invoice.create({
        data: { 
          ...invoiceFixture.valid(taxProfile.id),
          status: 'DRAFT'
        } as any
      });
      const invoiceRequestDelete = await request(app)
        .delete(`/api/invoices/${invoice.id}/permanent`)
        .set('Authorization', token);
      expect(invoiceRequestDelete.status).toBe(204);
      const notFoundInvoiceFromDB = await prisma.invoice.findUnique({ where: { id: invoice.id }});
      expect(notFoundInvoiceFromDB).toBeNull();
    });

    it('should permanently delete a CANCELLED invoice', async () => {
      const {token, user } = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoice = await prisma.invoice.create({
        data: { 
          ...invoiceFixture.valid(taxProfile.id),
          status: 'CANCELLED' 
        } as any
      });
      const invoiceRequestDelete = await request(app)
        .delete(`/api/invoices/${invoice.id}/permanent`)
        .set('Authorization', token);
      expect(invoiceRequestDelete.status).toBe(204);
      const notFoundInvoiceFromDB = await prisma.invoice.findUnique({ where: { id: invoice.id }});
      expect(notFoundInvoiceFromDB).toBeNull();
    });


    it('should not have the hard delettion for PENDING invoice', async () => {
      const { token, user } = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoice = await prisma.invoice.create({
        data: { ...invoiceFixture.valid(taxProfile.id) } as any
      });
      const invoiceRequestDelete = await request(app)
        .delete(`/api/invoices/${invoice.id}/permanent`)
        .set('Authorization', token);
      expect(invoiceRequestDelete.status).toBe(403);
      const checkInvoiceFromDB = await prisma.invoice.findUnique({ where: { id: invoice.id }});
      expect(checkInvoiceFromDB).not.toBeNull();
    });

    it('should REFUSE hard deletion for PAID invoice', async () => {
      const { token, user } = await getAuthToken();
      const taxProfile = await prisma.taxProfile.create({
        data: taxProfileFixture.valid(user.id) as any
      });
      const invoice = await prisma.invoice.create({
        data: { 
          ...invoiceFixture.valid(taxProfile.id),
          status: 'PAID' 
        } as any
      });
      const invoiceRequestDelete = await request(app)
        .delete(`/api/invoices/${invoice.id}/permanent`)
        .set('Authorization', token);
      expect(invoiceRequestDelete.status).toBe(403);
      const checkInvoiceFromDB = await prisma.invoice.findUnique({ where: { id: invoice.id }});
      expect(checkInvoiceFromDB).not.toBeNull();
    });

  });
});