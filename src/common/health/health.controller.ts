import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaHealthIndicator } from './prisma.health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @SkipThrottle()
  check() {
    return this.health.check([() => this.prismaHealthIndicator.isHealthy('prisma')]);
  }
}
