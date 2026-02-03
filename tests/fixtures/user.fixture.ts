import {hashPassword} from '../../src/utils/hash';

export const userFixture = {
  valid: {
    email: `mario.rossi1@mail.com`,
    password: 'MarioP4ssword123!',
    firstName: 'Mario',
    lastName: 'Rossi',
    status: 'ACTIVE' as const,
  },
  validHashed: async () => ({
    email: `mario.rossi1@mail.com`,
    password: await hashPassword('MarioP4ssword123!'),
    firstName: 'Mario',
    lastName: 'Rossi',
    status: 'ACTIVE' as const,
  }),
  multiple: [
    {
      email: 'luigi1.verdi@mail.com',
      password: 'LuigiP4ssword123!',
      firstName: 'Luigi',
      lastName: 'Verdi',
      status: 'ACTIVE' as const,
    },
    {
      email: 'marco1.bianchi@mail.com',
      password: 'MarcoP4ssword123!',
      firstName: 'Marco',
      lastName: 'Bianchi',
      status: 'ACTIVE' as const,
    },
  ],
};