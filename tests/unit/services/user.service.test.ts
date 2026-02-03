import bcrypt from 'bcrypt';
import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../../../src/services/user.service';
import { prisma } from '../../setup';
import { userFixture } from '../../fixtures/user.fixture';

const userService = new UserService(prisma);

describe('UserService', () => {
  describe('create', () => {
    it('should create a user successfully', async () => {
      const user = await userService.create(userFixture.valid);
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userFixture.valid.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should hash the password upon creation', async () => {
      const newUser = await userService.create({
        ...userFixture.valid,
        email: 'pincopallino@mail.com'
      });

      const userFoundFromDB = await prisma.user.findUnique({ where: { id: newUser.id } });      
      expect(userFoundFromDB).toBeDefined();
      expect(userFoundFromDB?.password).not.toBe(userFixture.valid.password);
      const isMatch = await bcrypt.compare(userFixture.valid.password, userFoundFromDB!.password);
      expect(isMatch).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      await userService.create(userFixture.valid);
      await expect(userService.create(userFixture.valid)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a user if exists', async () => {
      const created = await userService.create(userFixture.valid);
      const userFoundFromDB = await userService.findOne(created.id);
      expect(userFoundFromDB?.id).toBe(created.id);
      expect(userFoundFromDB?.email).toBe(created.email);
    });

    it('should return null if user does not exist', async () => {
      const userNotFoundFromDB = await userService.findOne(99999);
      expect(userNotFoundFromDB).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      await userService.create({ ...userFixture.valid, email: 'a_test@mail.com' });
      await userService.create({ ...userFixture.valid, email: 'b_test@mail.com' });
      await userService.create({ ...userFixture.valid, email: 'c_test@mail.com' });
      const usersFoundFromDB = await userService.findAll({ page: 1, limit: 2 });
      expect(usersFoundFromDB.data).toHaveLength(2);
      expect(usersFoundFromDB.total).toBeGreaterThanOrEqual(3);
      expect(usersFoundFromDB.page).toBe(1);
    });

    it('should filter users by email', async () => {
      await userService.create({ ...userFixture.valid, email: 'my_email_filter@mail.com' });
      await userService.create({ ...userFixture.valid, email: 'your_email_filter@mail.com' });
      const usersFoundFromDB = await userService.findAll({ email: 'my_email_filter' });
      expect(usersFoundFromDB.data).toHaveLength(1);
      expect(usersFoundFromDB.data[0].email).toBe('my_email_filter@mail.com');
    });
  });

  describe('update', () => {
    it('should update user details', async () => {
      const createdUser = await userService.create(userFixture.valid);
      const updatedUser = await userService.update(createdUser.id, {
        firstName: 'updatedFirstName'
      });
      expect(updatedUser.firstName).toBe('updatedFirstName');
    });

  });

  describe('soft delete and restore user', () => {
    it('should soft delete a user', async () => {
      const createdUser = await userService.create(userFixture.valid);
      const deletedUser = await userService.softDelete(createdUser.id);
      expect(deletedUser.deletedAt).not.toBeNull();
      const list = await userService.findAll({ email: createdUser.email });
      expect(list.data).toHaveLength(0);
    });

    it('should restore a soft deleted user', async () => {
      const createdUser = await userService.create(userFixture.valid);
      await userService.softDelete(createdUser.id);
      const restoredUser = await userService.restore(createdUser.id);
      expect(restoredUser.deletedAt).toBeNull();
      const list = await userService.findAll({ email: createdUser.email });
      expect(list.data).toHaveLength(1);
    });
  });

  describe('hardDelete', () => {
    it('should permanently remove the user from db', async () => {
      const createdUser = await userService.create(userFixture.valid);
      await userService.hardDelete(createdUser.id);
      const userNotFoundFromDB = await prisma.user.findUnique({ where: { id: createdUser.id } });
      expect(userNotFoundFromDB).toBeNull();
    });
  });
  
});