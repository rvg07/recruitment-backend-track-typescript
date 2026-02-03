import {describe, it, expect } from 'vitest';
import {createUserSchema,userQuerySchema } from '../../../src/models/user.schema';
 
describe('Schema Validation', () => {

  describe('UserQuerySchema', () => {
    it('should use default values for page and limit if empty', () => {
      const result = userQuerySchema.safeParse({ query: {} });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(1);
        expect(result.data.query.limit).toBe(10);
      }
    });

    it('should coerce string numbers to actual numbers', () => {
      const input = {
        query: {
          page: "2",
          limit: "60"
        }
      };
      const result = userQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.query.page).toBe('number');
        expect(result.data.query.page).toBe(2);
        expect(result.data.query.limit).toBe(60);
      }
    });

    it('should fail for invalid types', () => {
      const input = {
        query: {
          page: "notAValidNumberForFilterPage"
        }
      };
      const result = userQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateUserSchema', () => {
    it('should fail for invalid email format', () => {
      const failedUserCreation = createUserSchema.safeParse({
        email: 'mario.rossi',
        password: 'mariosrossiPassword123!'
      });
      expect(failedUserCreation.success).toBe(false);
    });
    it('should fail for short password', () => {
      const failedUserCreation = createUserSchema.safeParse({
        email: 'mario.rossi@mail.com',
        password: '123'
      });
      expect(failedUserCreation.success).toBe(false);
    });


  });

});