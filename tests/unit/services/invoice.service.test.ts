import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceService } from '../../../src/services/invoice.service';
import { prisma } from '../../setup';
import { invoiceFixture } from '../../fixtures/invoice.fixture';
import { userFixture } from '../../fixtures/user.fixture';
import { taxProfileFixture } from '../../fixtures/taxProfile.fixture';

describe('InvoiceService', () => {
  let invoiceService: InvoiceService;
  let user: any;
  let taxProfile: any;

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.taxProfile.deleteMany();
    await prisma.user.deleteMany();
    invoiceService = new InvoiceService();
    user = await prisma.user.create({
      data: userFixture.valid
    });
    taxProfile = await prisma.taxProfile.create({
      data: taxProfileFixture.valid(user.id) as any
    });
  });

  it('should create an invoice', async () => {
    const invoiceData = invoiceFixture.valid(taxProfile.id);
    const invoiceCreated = await invoiceService.create(invoiceData as any);
    expect(invoiceCreated).toHaveProperty('id');
    expect(invoiceCreated.invoiceNumber).toBe(invoiceData.invoiceNumber);
    expect(Number(invoiceCreated.amount)).toBe(Number(invoiceData.amount));
  });

  it('should return user invoices', async () => {
    const invoiceDataFirst = invoiceFixture.multiple(taxProfile.id)[0]; //we take INV-2026-002
    const invoiceDataSecond = invoiceFixture.multiple(taxProfile.id)[1]; //we take INV-2026-003
    await prisma.invoice.create({ data: { ...invoiceDataFirst} as any });
    await prisma.invoice.create({ data: { ...invoiceDataSecond} as any });
    const invoices = await invoiceService.findAll(taxProfile.id);
    expect(invoices.meta.total).toBe(2);
  });

  it('should allow soft deletion invoice for PENDING invoices', async () => {
    const invoiceCreated = await prisma.invoice.create({
      data: { ...invoiceFixture.valid(taxProfile.id), status: 'PENDING' } as any
    });
    await invoiceService.softDelete(invoiceCreated.id);
    const foundInvoiceDB = await prisma.invoice.findUnique({ where: { id: invoiceCreated.id } });
    expect(foundInvoiceDB?.deletedAt).not.toBeNull();
    expect(foundInvoiceDB?.status).toBe('PENDING');
  });

  it('should allow hard deletion DRAFT invoices', async () => {
    const invoiceCreated = await prisma.invoice.create({
      data: { ...invoiceFixture.valid(taxProfile.id), status: 'DRAFT' } as any
    });
    await invoiceService.hardDelete(invoiceCreated.id);
    const notFoundInvoiceDB = await prisma.invoice.findUnique({ where: { id: invoiceCreated.id } });
    expect(notFoundInvoiceDB).toBeNull(); 
  });

  it('should block hard deletion on PAID invoices', async () => {
    const invoiceCreated = await prisma.invoice.create({
      data: { ...invoiceFixture.valid(taxProfile.id), status: 'PAID' } as any
    });
    await expect(invoiceService.hardDelete(invoiceCreated.id))
      .rejects
      .toThrow();
    const foundInvoiceDB = await prisma.invoice.findUnique({ where: { id: invoiceCreated.id } });
    expect(foundInvoiceDB).not.toBeNull();
  });

});