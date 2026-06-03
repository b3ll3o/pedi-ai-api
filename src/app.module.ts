import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { InfrastructureModule } from './infrastructure/database/infrastructure.module';
import { HealthModule } from './common/health/health.module';
import { UsuariosModule } from './application/usuarios/usuarios.application.module';
import { PerfisModule } from './application/perfis/perfis.application.module';
import { PermissoesModule } from './application/permissoes/permissoes.application.module';
import { AuthModule } from './presentation/auth/auth.module';
import { RestauranteModule } from './restaurante/restaurante.module';

const parseThrottleLimit = (value: string | undefined, fallback: number): number => {
  const parsed = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'short',
            ttl: 60_000,
            limit: parseThrottleLimit(process.env.THROTTLE_SHORT_LIMIT, 5),
          },
          {
            name: 'long',
            ttl: 3_600_000,
            limit: parseThrottleLimit(process.env.THROTTLE_LONG_LIMIT, 30),
          },
        ],
      }),
    }),
    InfrastructureModule,
    HealthModule,
    UsuariosModule,
    PerfisModule,
    PermissoesModule,
    AuthModule,
    RestauranteModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
