import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import {CreateInvoiceDto,UpdateInvoiceDto,InvoiceQueryDto,InvoiceParams} from '../models/invoice.schema';

export const findAll = async (req: Request<{}, {}, {}, InvoiceQueryDto>,res: Response,next: NextFunction) => {
  try {
    const result = await invoiceService.findAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req: Request<InvoiceParams>,res: Response,next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const invoice = await invoiceService.findOne(id);
    if (!invoice) {
      res.status(404).json({ status: 'error', message: 'Invoice not found' });
      return;
    }
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request<{}, {}, CreateInvoiceDto>,res: Response,next: NextFunction) => {
  try {
    const invoice = await invoiceService.create(req.body);
    res.status(201).json(invoice);
  } catch (error: any) {
    if (error instanceof Error && error.message === 'DUPLICATE_INVOICE_NUMBER') {
      return res.status(409).json({
        status: 'error',
        message: 'invoiceNumber already exists for this tax profile',
        code: 'DUPLICATE_ENTRY'
      });
    }
    next(error);
  }
};

export const update = async (req: Request<InvoiceParams, {}, UpdateInvoiceDto>,res: Response,next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existingInvoice = await invoiceService.findOne(id);
    if (!existingInvoice) {
      res.status(404).json({ status: 'error', message: 'Invoice not found' });
      return;
    }
    const updatedInvoice = await invoiceService.update(id, req.body);
    res.json(updatedInvoice);
  } catch (error) {
    next(error);
  }
};

export const softDelete = async (req: Request<InvoiceParams>,res: Response,next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await invoiceService.softDelete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const hardDelete = async (req: Request<InvoiceParams>,res: Response,next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await invoiceService.hardDelete(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(403).json({ status: 'error', message: error.message });
    } else {
      next(error);
    }
  }
};

export const restore = async (req: Request<InvoiceParams>,res: Response,next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await invoiceService.restore(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
