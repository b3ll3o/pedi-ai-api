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
    try {
      const restaurantes = await this.repository.findAll();
      return restaurantes.map((r) => RestauranteResponseDto.fromEntity(r));
    } catch (error) {
      throw error;
    }
  }
}
