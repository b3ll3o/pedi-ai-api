import { Inject } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteResponseDto } from '../dto/restaurante.dto';

export class ListarRestaurantesUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY) private readonly repository: IRestaurantesRepository,
  ) {}

  async execute(): Promise<RestauranteResponseDto[]> {
    console.log('[ListarRestaurantesUseCase] About to call repository.findAll');
    try {
      const restaurantes = await this.repository.findAll();
      console.log('[ListarRestaurantesUseCase] Got restaurants:', restaurantes.length);
      return restaurantes.map((r) => RestauranteResponseDto.fromEntity(r));
    } catch (error) {
      console.error('[ListarRestaurantesUseCase] Error:', error.message);
      console.error('[ListarRestaurantesUseCase] Stack:', error.stack);
      throw error;
    }
  }
}
