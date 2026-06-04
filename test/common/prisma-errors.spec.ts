import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '../../src/common/prisma-errors';

describe('handlePrismaError', () => {
  it('deve lançar ConflictException quando Prisma retorna P2002 (unique constraint)', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });

    expect(() => handlePrismaError(prismaError, 'Email já cadastrado')).toThrow(ConflictException);

    try {
      handlePrismaError(prismaError, 'Email já cadastrado');
    } catch (err) {
      expect(err).toBeInstanceOf(ConflictException);
      expect((err as ConflictException).message).toBe('Email já cadastrado');
    }
  });

  it('deve lançar NotFoundException quando Prisma retorna P2025 e notFoundMessage foi fornecido', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

    expect(() => handlePrismaError(prismaError, 'conflito', 'Registro não encontrado')).toThrow(
      NotFoundException,
    );

    try {
      handlePrismaError(prismaError, 'conflito', 'Registro não encontrado');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect((err as NotFoundException).message).toBe('Registro não encontrado');
    }
  });

  it('deve re-lançar P2025 sem transformar quando notFoundMessage é undefined', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

    expect(() => handlePrismaError(prismaError, 'conflito')).toThrow(prismaError);
  });

  it('deve re-lançar P2025 sem transformar quando notFoundMessage é string vazia', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

    expect(() => handlePrismaError(prismaError, 'conflito', '')).toThrow(prismaError);
  });

  it('deve re-lançar erros que não são PrismaClientKnownRequestError', () => {
    const genericError = new Error('Database connection failed');

    expect(() => handlePrismaError(genericError, 'conflito')).toThrow(genericError);
  });

  it('deve re-lançar outros códigos de Prisma sem transformar', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Other error', {
      code: 'P2003',
      clientVersion: 'test',
    });

    expect(() => handlePrismaError(prismaError, 'conflito')).toThrow(prismaError);
  });

  it('deve re-lançar strings e valores não-Error', () => {
    expect(() => handlePrismaError('string error', 'conflito')).toThrow('string error');
    expect(() => handlePrismaError(null, 'conflito')).toThrow();
    expect(() => handlePrismaError(undefined, 'conflito')).toThrow();
  });
});
