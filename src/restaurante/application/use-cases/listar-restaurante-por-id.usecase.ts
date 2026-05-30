import { Inject, NotFoundException } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteResponseDto } from '../dto/restaurante.dto';

export class ListarRestaurantePorIdUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY) private readonly repository: IRestaurantesRepository,
  ) {}

  async execute(id: string): Promise<RestauranteResponseDto> {
    const restaurante = await this.repository.findById(id);
    if (!restaurante) {
      throw new NotFoundException('Restaurante não encontrado');
    }
    return RestauranteResponseDto.fromEntity(restaurante);
  }
}
