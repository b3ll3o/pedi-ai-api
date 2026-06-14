import { Inject } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';

export class ContarRestaurantesUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY)
    private readonly restaurantesRepository: IRestaurantesRepository,
  ) {}

  async execute(): Promise<number> {
    return this.restaurantesRepository.count();
  }
}
