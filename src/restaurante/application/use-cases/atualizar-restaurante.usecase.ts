import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteEntity } from '../../domain/entities/restaurante.entity';
import { AtualizarRestauranteDto, RestauranteResponseDto } from '../dto/restaurante.dto';
import { handlePrismaError } from '../../../common/prisma-errors';

export class AtualizarRestauranteUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY) private readonly repository: IRestaurantesRepository,
  ) {}

  async execute(id: string, dto: AtualizarRestauranteDto): Promise<RestauranteResponseDto> {
    const restaurante = await this.repository.findById(id);
    if (!restaurante) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    // Merge com o estado atual: validar o PAR resultante após aplicar o patch,
    // não só os campos enviados. Sem isso, um PATCH com apenas horarioAbertura
    // pode produzir abertura > fechamento.
    const horarioAbertura = dto.horarioAbertura ?? restaurante.horarioAbertura;
    const horarioFechamento = dto.horarioFechamento ?? restaurante.horarioFechamento;
    if (RestauranteEntity.compararHorarios(horarioAbertura, horarioFechamento) >= 0) {
      throw new ConflictException('Horário de abertura deve ser anterior ao fechamento');
    }

    try {
      const updated = await this.repository.update(id, dto);
      return RestauranteResponseDto.fromEntity(updated);
    } catch (error) {
      // P2002: race condition — dois PATCH concorrentes no mesmo CNPJ
      // (o @unique CNPJ é a verdadeira fonte da verdade; o repository já
      // filtra soft-delete, mas não verifica duplicata de CNPJ).
      handlePrismaError(error, 'CNPJ já cadastrado', 'Restaurante nao encontrado');
    }
  }
}
