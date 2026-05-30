import { Inject, BadRequestException } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';
import { CriarRestauranteDto, RestauranteResponseDto } from '../dto/restaurante.dto';

export class CriarRestauranteUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY) private readonly repository: IRestaurantesRepository,
  ) {}

  async execute(dto: CriarRestauranteDto): Promise<RestauranteResponseDto> {
    // Verificar se CNPJ já existe
    const existingRestaurante = await this.repository.findByCnpj(dto.cnpj);
    if (existingRestaurante) {
      throw new BadRequestException('CNPJ já cadastrado');
    }

    // Validar horários
    if (dto.horarioAbertura >= dto.horarioFechamento) {
      throw new BadRequestException('Horário de abertura deve ser anterior ao fechamento');
    }

    // Criar restaurante
    try {
      const restaurante = await this.repository.create({
        nome: dto.nome,
        cnpj: dto.cnpj,
        email: dto.email,
        telefone: dto.telefone,
        endereco: dto.endereco,
        cidade: dto.cidade,
        estado: dto.estado,
        cep: dto.cep,
        horarioAbertura: dto.horarioAbertura,
        horarioFechamento: dto.horarioFechamento,
      });

      return RestauranteResponseDto.fromEntity(restaurante);
    } catch (error) {
      // Tratar erro de constraint única do PostgreSQL
      if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
        throw new BadRequestException('CNPJ já cadastrado');
      }
      throw error;
    }
  }
}
