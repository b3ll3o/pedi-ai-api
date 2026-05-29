import { IRestaurantesRepository } from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteResponseDto } from '../dto/restaurante.dto';

export class ListarRestaurantesUseCase {
  constructor(private readonly repository: IRestaurantesRepository) {}

  async execute(): Promise<RestauranteResponseDto[]> {
    const restaurantes = await this.repository.findAll();
    return restaurantes.map(r => RestauranteResponseDto.fromEntity(r));
  }
}