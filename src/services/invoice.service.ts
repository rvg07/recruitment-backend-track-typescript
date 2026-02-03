import {Prisma, PrismaClient } from '@prisma/client';
import {prisma as prismaClientConnection } from '../lib/prisma';
import {CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from '../models/invoice.schema';
import {logger} from '../utils/logger';

export class InvoiceService {
  constructor(private prisma: PrismaClient = prismaClientConnection) {}
  async findAll(filters: Partial<InvoiceQueryDto>) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.date) {
      where.issueDate = filters.date;
    }
    const [total, data] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          taxProfile: {
            select: {
              companyName: true,
              vatNumber: true,
              email: true
            }
          }
        },
        orderBy: { issueDate: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        taxProfile: true,
      },
    });
    if (!invoice) {
      logger.warn(`Invoice not found. `, { invoiceId: id });
    }
    return invoice;
  }

  async create(data: CreateInvoiceDto) {
    
    logger.info('Creating new invoice. ', { 
      taxProfileId: data.taxProfileId,
      invoiceNumber: data.invoiceNumber
    });

    try {
      const resultCreation =  await this.prisma.invoice.create({
        data: {
          taxProfileId: data.taxProfileId,
          invoiceNumber: data.invoiceNumber,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          description: data.description,
          notes: data.notes,
        },
        include: {
          taxProfile: true
        }
      });
      logger.info('Invoice created successfully. ', { invoiceId: resultCreation.id, invoiceNumber: resultCreation.invoiceNumber });
      return resultCreation;
    } catch (error: any) {
      console.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        logger.warn('Creation invoice failed. Error duplicate invoice number. ', { 
          invoiceNumber: data.invoiceNumber,
          taxProfileId: data.taxProfileId
        });
        throw new Error('DUPLICATE_INVOICE_NUMBER');
      }
      logger.error('Unexpected error during creating invoice: ', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async update(id: number, data: UpdateInvoiceDto) {
    logger.info('Updating invoice. ', { invoiceId: id, updateFields: Object.keys(data) });
    const updatedInvoice= await this.prisma.invoice.update({
      where: { id },
      data: {...data},
      include: {
        taxProfile: true
      }
    });
    return updatedInvoice;
  }

  async softDelete(id: number) {
    logger.info('Soft deleting invoice. ', { invoiceId: id });
    const softDeletingInvoice = this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return softDeletingInvoice;
  }

  async hardDelete(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      select: { status: true, invoiceNumber: true }
    });
    if (!invoice){
      logger.warn('Hard deleteion failed. Invoice not found. ', { invoiceId: id });
      throw new Error("Invoice not found");
    }
    const canHardDeleteMethod = ['DRAFT', 'CANCELLED'].includes(invoice.status);
    if (!canHardDeleteMethod) {
      logger.warn('Hard deleteion blocked. Invalid invoice status. ', { 
        invoiceId: id, 
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status 
      });
      throw new Error(`Cannot permanently delete invoice number ${invoice.invoiceNumber}`);
    }

    logger.info('Hard deletion invoice. ', { invoiceId: id, invoiceNumber: invoice.invoiceNumber });
    return this.prisma.invoice.delete({
      where: { id }
    });
  }

  async restore(id: number) {
    logger.info('Restoring soft deletion invoice. ', { invoiceId: id });
    const restoringInvoice= this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: null }
    });
    return restoringInvoice;
  }
}

export const invoiceService = new InvoiceService();