import { Inject, BadRequestException } from '@nestjs/common';
import {
  IRestaurantesRepository,
  IRESTAURANTES_REPOSITORY,
} from '../../domain/repositories/restaurantes-repository.interface';
import { RestauranteEntity } from '../../domain/entities/restaurante.entity';
import { CriarRestauranteDto, RestauranteResponseDto } from '../dto/restaurante.dto';
import { handlePrismaError } from '../../../common/prisma-errors';

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

    // Sem pre-check CNPJ: o @unique do schema já é a fonte da verdade e o
    // P2002 do handlePrismaError cobre tanto colisões serializadas quanto
    // races (dois POSTs simultâneos com mesmo CNPJ). O pre-check anterior
    // tinha dois custos: 1) round-trip extra no caminho feliz; 2) TOCTOU
    // entre find e create — race podia vazar P2002 e cair no catch.
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
      handlePrismaError(error, 'CNPJ já cadastrado');
    }
  }
}
