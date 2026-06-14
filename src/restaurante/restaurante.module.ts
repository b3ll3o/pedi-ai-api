import { Module } from '@nestjs/common';
import { RestaurantesController } from './presentation/restaurantes/restaurantes.controller';
import { RestaurantesRepositoryImpl } from './infrastructure/persistence/restaurantes-repository.impl';
import { IRESTAURANTES_REPOSITORY } from './domain/repositories/restaurantes-repository.interface';
import { CriarRestauranteUseCase } from './application/use-cases/criar-restaurante.usecase';
import { ListarRestaurantesUseCase } from './application/use-cases/listar-restaurantes.usecase';
import { ListarRestaurantePorIdUseCase } from './application/use-cases/listar-restaurante-por-id.usecase';
import { AtualizarRestauranteUseCase } from './application/use-cases/atualizar-restaurante.usecase';
import { DeletarRestauranteUseCase } from './application/use-cases/deletar-restaurante.usecase';
import { ContarRestaurantesUseCase } from './application/use-cases/contar-restaurantes.usecase';
import { AuthModule } from '../presentation/auth/auth.module';
import { PrismaModule } from '../infrastructure/database/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [RestaurantesController],
  providers: [
    {
      provide: IRESTAURANTES_REPOSITORY,
      useClass: RestaurantesRepositoryImpl,
    },
    CriarRestauranteUseCase,
    ListarRestaurantesUseCase,
    ListarRestaurantePorIdUseCase,
    AtualizarRestauranteUseCase,
    DeletarRestauranteUseCase,
    ContarRestaurantesUseCase,
  ],
  exports: [IRESTAURANTES_REPOSITORY],
})
export class RestauranteModule {}
