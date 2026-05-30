import { Inject, NotFoundException } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';

export class DeletarRestauranteUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY) private readonly repository: IRestaurantesRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const restaurante = await this.repository.findById(id);
    if (!restaurante) {
      throw new NotFoundException('Restaurante não encontrado');
    }
    await this.repository.softDelete(id);
  }
}
