import {Prisma,PrismaClient } from '@prisma/client';
import {prisma as defaultPrisma } from '../lib/prisma';
import {CreateTaxProfileDto, UpdateTaxProfileDto, TaxProfileQueryDto } from '../models/taxProfile.schema';
import {logger} from '../utils/logger';

export class TaxProfileService {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findAll(filters: Partial<TaxProfileQueryDto>, userId?: number) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (userId) where.userId = userId;
    if (filters.companyName) where.companyName = { contains: filters.companyName };
    if (filters.vatNumber) where.vatNumber = { contains: filters.vatNumber };
    const [total, data] = await Promise.all([
      this.prisma.taxProfile.count({ where }),
      this.prisma.taxProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);
    return { total, page, limit, data };
  }

  async findOne(id: number) {
    const findTaxProfile=this.prisma.taxProfile.findUnique({
      where: { id }
    });
    if (!findTaxProfile) {
      logger.warn(`Tax profile not found. `, { taxProfileId: id });
    }
    return findTaxProfile;
  }

  async create(userId: number, data: CreateTaxProfileDto) {
    logger.info('Creating new tax profile. ', { 
      userId, 
      companyName: data.companyName,
      vatNumber: data.vatNumber 
    });

    try {
      const newTaxProfile = await this.prisma.taxProfile.create({
        data: {
          ...data,
          userId: userId
        }
      });
      logger.info('Tax profile created successfully. ', { taxProfileId: newTaxProfile.id });
      return newTaxProfile;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        logger.warn('Creation tax profile failed. Error duplicate entry. ', { 
          userId, 
          vatNumber: data.vatNumber
        });
        throw new Error(`Tax profile already exists`);
      }
      logger.error('Unexpected error on creating tax profile. ', { error: error.message });
      throw error;
    }
  }

  async update(id: number, data: UpdateTaxProfileDto) {
    logger.info('Updating tax profile. ', { taxProfileId: id, fields: Object.keys(data) });
    const updateTaxProfile= this.prisma.taxProfile.update({
      where: { id },
      data
    });
    return updateTaxProfile;
  }

  async softDelete(id: number) {
    logger.info('Soft deleting tax profile. ', { profileId: id });
    const softDeletingTaxProfile= this.prisma.taxProfile.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return softDeletingTaxProfile;
  }

  async hardDelete(id: number) {
    logger.info('Hard deleting tax profile. ', { profileId: id });
    try {
      return await this.prisma.taxProfile.delete({ where: { id } });
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      if (error.code === 'P2025') {
        logger.warn('Hard deletion failed. Tax profile not found. ', { profileId: id });
        throw new Error('Tax Profile not found');
      }
      throw error;
    }
  }

  async restore(id: number) {
    logger.info('Restoring tax profile. ', { profileId: id });
    const restoringTaxProfile= this.prisma.taxProfile.update({
      where: { id },
      data: { deletedAt: null }
    });
    return restoringTaxProfile
  }
}

export const taxProfileService = new TaxProfileService();