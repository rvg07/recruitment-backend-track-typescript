import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../src/services/auth.service';
import { prisma } from '../../setup';
import { userFixture } from '../../fixtures/user.fixture';

const authService = new AuthService(prisma);

describe('AuthService', () => {

  beforeEach(async () => {
    await prisma.user.deleteMany({ 
      where: { email: userFixture.valid.email } 
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userRegistered = await authService.register(userFixture.valid);
      expect(userRegistered).toHaveProperty('token');
      expect(userRegistered.user).toHaveProperty('id');
      expect(userRegistered.user.email).toBe(userFixture.valid.email);
      expect(userRegistered.user).not.toHaveProperty('password');
      const foundUserFromDB = await prisma.user.findUnique({ where: { id: userRegistered.user.id } });
      expect(foundUserFromDB).toBeDefined();
      expect(foundUserFromDB?.password).not.toBe(userFixture.valid.password);
      const isMatch = await bcrypt.compare(userFixture.valid.password, foundUserFromDB!.password);
      expect(isMatch).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      await authService.register(userFixture.valid);
      await expect(authService.register(userFixture.valid))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      await authService.register(userFixture.valid);
      const loginUser = await authService.login({
        email: userFixture.valid.email,
        password: userFixture.valid.password
      });
      expect(loginUser).toHaveProperty('token');
      expect(loginUser.user.email).toBe(userFixture.valid.email);
      const decoded = jwt.decode(loginUser.token);
      expect(decoded).toHaveProperty('id', loginUser.user.id);
    });

    it('should throw error for non existent email', async () => {
      await expect(authService.login({
        email: 'not_valid_user_email@mail.com',
        password: 'notValidPassword123!'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      await authService.register(userFixture.valid);
      await expect(authService.login({
        email: userFixture.valid.email,
        password: 'wrongPassword123!'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if account is soft deleted', async () => {  
      const userData = await userFixture.validHashed();
      await prisma.user.create({
        data: {
          ...userData,
          deletedAt: new Date()
        }
      });

      await expect(authService.login({
        email: userFixture.valid.email,
        password: userFixture.valid.password
      })).rejects.toThrow('Account deleted');

    });

    it('should throw error if account is suspended', async () => {
      const userData = await userFixture.validHashed();
      await prisma.user.create({
        data: {
          ...userData,
          status: 'SUSPENDED'
        }
      });
      await expect(authService.login({
        email: userFixture.valid.email,
        password: userFixture.valid.password
      })).rejects.toThrow('Account suspended');

    });
    
  });


});