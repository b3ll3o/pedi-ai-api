import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/database/infrastructure.module';
import { HealthModule } from './common/health/health.module';
import { UsuariosModule } from './application/usuarios/usuarios.application.module';
import { PerfisModule } from './application/perfis/perfis.application.module';
import { PermissoesModule } from './application/permissoes/permissoes.application.module';
import { AuthModule } from './presentation/auth/auth.module';
import { RestauranteModule } from './restaurante/restaurante.module';

@Module({
  imports: [
    InfrastructureModule,
    HealthModule,
    UsuariosModule,
    PerfisModule,
    PermissoesModule,
    AuthModule,
    RestauranteModule,
  ],
})
export class AppModule {}
