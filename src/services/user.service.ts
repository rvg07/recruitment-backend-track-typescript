import bcrypt from 'bcrypt';
import {Prisma, PrismaClient } from '@prisma/client';
import { prisma as prismaConnection } from '../lib/prisma';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../models/user.schema';
import {logger} from '../utils/logger';

const SALT_ROUNDS = 10;

export class UserService {
  constructor(private prisma: PrismaClient = prismaConnection) {}

  async findAll(filters: Partial<UserQueryDto>) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (filters.email) where.email = { contains: filters.email };
    if (filters.status) where.status = filters.status;

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, email: true, firstName: true, lastName: true, status: true, createdAt: true } 
      })
    ]);

    return { total, page, limit, data };
  }

  async findOne(id: number) {
    const findUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, status: true, createdAt: true }
    });
    if (!findUser) {
      logger.warn('User not found. ', { userId: id });
    }
    return findUser;
  }

  async findDeleted() {
    return this.prisma.user.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, email: true, deletedAt: true }
    });
  }

  async create(data: CreateUserDto) {
    logger.info('Creating new user. ', { email: data.email, role: data.status });
    try {
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      const newUser = await this.prisma.user.create({
        data: { ...data, password: hashedPassword },
        select: { id: true, email: true, status: true }
      });
      logger.info('User created successfully. ', { userId: newUser.id });
      return newUser;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        logger.warn('User creation failed. Email already exists. ', { email: data.email });
        throw new Error('Email already exists');
      }
      logger.error('Unexpected error on creating new user. ', { error: error.message });
      throw error;
    }
  }

  async update(id: number, data: UpdateUserDto) {
    logger.info('Updating user profile. ', { userId: id, fields: Object.keys(data) });
    try {
      const { password, ...rest } = data;
      const updateData: any = {...rest};
      if (password) {
        updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, firstName:true, lastName:true, email: true, status: true, updatedAt: true }
      });
      return updatedUser;
    } catch (error: any) {
       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        logger.warn('Update failed. User not found. ', { userId: id });
        throw new Error('User not found');
      }
      logger.error('Error on updating user. ', { userId: id, error: error.message });
      throw error;
    }
  }

  async softDelete(id: number) {
    logger.info('Soft deleting user. ', { userId: id });
    const softDeletingUser = this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return softDeletingUser;
  }

  async hardDelete(id: number) {
    logger.warn('Hard deleting user. ', { userId: id });
    try {
      return await this.prisma.user.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
         logger.warn('Hard deletion failed. User not found. ', { userId: id });
         throw new Error('User not found');
      }
      throw error;
    }
  }

  async restore(id: number) {
    logger.info('Restoring deleting user. ', { userId: id });
    const restoringUser=this.prisma.user.update({
      where: { id },
      data: { deletedAt: null }
    });
    return restoringUser;
  }
}

export const userService = new UserService();