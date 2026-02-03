import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { prisma as prismaClientConnection } from '../lib/prisma';
import { RegisterDto, LoginDto } from '../models/auth.schema';
import { logger } from '../utils/logger';

const SECRET = process.env.JWT_SECRET || 'secret';
const SALT_ROUNDS = 10;

export class AuthService {
  constructor(private prisma: PrismaClient = prismaClientConnection) {}

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      logger.warn(`Login failed. User not found. `, { email: data.email });
      throw new Error('Invalid credentials');
    }
    if (user.deletedAt) {
      logger.warn(`Login blocked. Account is deleted. `, { userId: user.id, email: user.email });
      throw new Error('Account deleted');
    }
    if (user.status === 'SUSPENDED') {
      logger.warn(`Login blocked. Account is suspended. `, { userId: user.id, email: user.email });
      throw new Error('Account suspended');
    }
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      logger.warn(`Login failed. Invalid password. `, { userId: user.id, email: user.email });
      throw new Error('Invalid credentials');
    }
    logger.info(`User logged successfully. `, { userId: user.id });
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      logger.warn(`Registration failed. Email already exists. `, { email: data.email });
      throw new Error('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    logger.info(`User registered successfully. `, { userId: user.id, email: user.email });
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}

export const authService = new AuthService();