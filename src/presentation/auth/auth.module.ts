import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesAuthGuard } from './guards/roles-auth.guard';
import { IUSUARIOS_REPOSITORY } from '../../domain/interfaces/usuarios-repository.interface';
import { IREFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/refresh-token-repository.interface';
import { IPERFIS_REPOSITORY } from '../../domain/interfaces/perfis-repository.interface';
import { ISENHA_HASH_SERVICE } from '../../domain/services/senha-hash.service';
import { UsuariosRepositoryImpl } from '../../infrastructure/database/prisma/repositories/usuarios-repository.impl';
import { RefreshTokenRepositoryImpl } from '../../infrastructure/database/prisma/repositories/refresh-token-repository.impl';
import { PerfisRepositoryImpl } from '../../infrastructure/database/prisma/repositories/perfis-repository.impl';
import { SenhaHashService } from '../../domain/services/senha-hash.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 900 },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: IUSUARIOS_REPOSITORY, useClass: UsuariosRepositoryImpl },
    { provide: IREFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenRepositoryImpl },
    { provide: IPERFIS_REPOSITORY, useClass: PerfisRepositoryImpl },
    { provide: ISENHA_HASH_SERVICE, useClass: SenhaHashService },
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RolesAuthGuard, IPERFIS_REPOSITORY],
})
export class AuthModule {}
