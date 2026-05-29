import { IRestaurantesRepository } from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteResponseDto } from '../dto/restaurante.dto';

export class ListarRestaurantePorIdUseCase {
  constructor(private readonly repository: IRestaurantesRepository) {}

  async execute(id: string): Promise<RestauranteResponseDto> {
    const restaurante = await this.repository.findById(id);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }
    return RestauranteResponseDto.fromEntity(restaurante);
  }
}
