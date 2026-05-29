import { IRestaurantesRepository } from '../../domain/repositories/restaurantes-repository.interface';
import { AtualizarRestauranteDto, RestauranteResponseDto } from '../dto/restaurante.dto';

export class AtualizarRestauranteUseCase {
  constructor(private readonly repository: IRestaurantesRepository) {}

  async execute(id: string, dto: AtualizarRestauranteDto): Promise<RestauranteResponseDto> {
    const restaurante = await this.repository.findById(id);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }

    // Validar horários se fornecidos
    if (dto.horarioAbertura && dto.horarioFechamento) {
      if (dto.horarioAbertura >= dto.horarioFechamento) {
        throw new Error('Horário de abertura deve ser anterior ao fechamento');
      }
    }

    const updated = await this.repository.update(id, dto);
    return RestauranteResponseDto.fromEntity(updated);
  }
}