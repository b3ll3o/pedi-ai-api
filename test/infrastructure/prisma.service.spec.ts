import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  };
});

describe('PrismaService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('deve jogar erro quando DATABASE_URL nao esta setada', () => {
      delete process.env.DATABASE_URL;

      expect(() => new PrismaService()).toThrow('DATABASE_URL environment variable is not set');
    });

    it('deve aceitar DATABASE_URL valida', () => {
      process.env.DATABASE_URL = 'postgresql:// usuario:senha@localhost:5432/pediai';

      expect(() => new PrismaService()).not.toThrow();
    });
  });

  describe('继承 PrismaClient', () => {
    it('deve ter metodos $connect e $disconnect', () => {
      process.env.DATABASE_URL = 'postgresql:// usuario:senha@localhost:5432/pediai';
      const service = new PrismaService();

      expect(typeof service.$connect).toBe('function');
      expect(typeof service.$disconnect).toBe('function');
    });
  });
});
