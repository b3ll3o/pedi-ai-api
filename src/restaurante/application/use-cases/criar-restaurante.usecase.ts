import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteEntity } from '../../domain/entities/restaurante.entity';
import { CriarRestauranteDto, RestauranteResponseDto } from '../dto/restaurante.dto';

export class CriarRestauranteUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY) private readonly repository: IRestaurantesRepository,
  ) {}

  async execute(dto: CriarRestauranteDto): Promise<RestauranteResponseDto> {
    // Instanciar a entidade força CNPJ checksum e validação de horário;
    // sem isso, o use-case estaria usando comparação de strings e ignorando
    // o algoritmo de validação definido no domínio.
    //
    // Erros de validação semântica (CNPJ malformado, horário invertido) são
    // BadRequest (400), não Conflict (409). Conflict é reservado para
    // colisões com estado existente — o CNPJ duplicado é Conflict, mas o
    // CNPJ inválido é BadRequest, e clientes que diferenciam (ex: retry só
    // em 409) precisam dessa distinção.
    let entity: RestauranteEntity;
    try {
      entity = new RestauranteEntity({
        nome: dto.nome,
        cnpj: dto.cnpj,
        email: dto.email ?? null,
        telefone: dto.telefone ?? null,
        endereco: dto.endereco,
        cidade: dto.cidade,
        estado: dto.estado,
        cep: dto.cep,
        horarioAbertura: dto.horarioAbertura,
        horarioFechamento: dto.horarioFechamento,
      });
    } catch (err) {
      throw new BadRequestException(err instanceof Error ? err.message : 'Dados inválidos');
    }

    // Verificar se CNPJ já existe
    const existingRestaurante = await this.repository.findByCnpj(entity.cnpj);
    if (existingRestaurante) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Criar restaurante
    try {
      const restaurante = await this.repository.create({
        nome: entity.nome,
        cnpj: entity.cnpj,
        email: entity.email,
        telefone: entity.telefone,
        endereco: entity.endereco,
        cidade: entity.cidade,
        estado: entity.estado,
        cep: entity.cep,
        horarioAbertura: entity.horarioAbertura,
        horarioFechamento: entity.horarioFechamento,
      });

      return RestauranteResponseDto.fromEntity(restaurante);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('CNPJ já cadastrado');
      }
      throw error;
    }
  }
}
