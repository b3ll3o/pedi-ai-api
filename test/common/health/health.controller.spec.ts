import { HealthController } from '../../../src/common/health/health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../../../src/common/health/prisma.health';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: jest.Mocked<HealthCheckService>;
  let mockPrismaHealthIndicator: jest.Mocked<PrismaHealthIndicator>;

  beforeEach(() => {
    mockHealthCheckService = {
      check: jest.fn(),
    } as any;

    mockPrismaHealthIndicator = {
      isHealthy: jest.fn(),
    } as any;

    controller = new HealthController(mockHealthCheckService, mockPrismaHealthIndicator);
  });

  describe('check', () => {
    it('deve chamar health.check com indicador prisma', async () => {
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok',
        details: { prisma: { status: 'up' } },
      });

      const resultado = await controller.check();

      expect(mockHealthCheckService.check).toHaveBeenCalled();
    });
  });
});
