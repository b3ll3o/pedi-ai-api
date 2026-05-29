import { Module } from '@nestjs/common';
import { RestaurantesController } from './presentation/restaurantes/restaurantes.controller';
import { RestaurantesRepositoryImpl } from './infrastructure/persistence/restaurantes-repository.impl';
import { IRESTAURANTES_REPOSITORY } from './domain/repositories/restaurantes-repository.interface';
import { CriarRestauranteUseCase } from './application/use-cases/criar-restaurante.usecase';
import { ListarRestaurantesUseCase } from './application/use-cases/listar-restaurantes.usecase';
import { ListarRestaurantePorIdUseCase } from './application/use-cases/listar-restaurante-por-id.usecase';
import { AtualizarRestauranteUseCase } from './application/use-cases/atualizar-restaurante.usecase';
import { DeletarRestauranteUseCase } from './application/use-cases/deletar-restaurante.usecase';

@Module({
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
  ],
  exports: [IRESTAURANTES_REPOSITORY],
})
export class RestauranteModule {}