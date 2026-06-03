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

  async execute(params?: { skip?: number; take?: number }): Promise<RestauranteResponseDto[]> {
    const restaurantes = await this.repository.findAll(params);
    return restaurantes.map((r) => RestauranteResponseDto.fromEntity(r));
  }
}
