import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../../src/common/health/prisma.health';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        PrismaHealthIndicator,
      ],
    }).compile();

    indicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('deve retornar healthy quando banco responde', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);

      const resultado = await indicator.isHealthy('prisma');

      expect(resultado).toEqual({ prisma: { status: 'up' } });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('deve lancar HealthCheckError quando banco nao responde', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      await expect(indicator.isHealthy('prisma')).rejects.toThrow(HealthCheckError);
    });
  });
});