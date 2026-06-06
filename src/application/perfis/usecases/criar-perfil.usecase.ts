import { ConflictException, Inject } from '@nestjs/common';
import {
  IPerfisRepository,
  IPERFIS_REPOSITORY,
} from '../../../domain/interfaces/perfis-repository.interface';
import { CriarPerfilParams } from '../../../domain/entities/perfil.entity';
import { handlePrismaError } from '../../../common/prisma-errors';

export class CriarPerfilUseCase {
  constructor(@Inject(IPERFIS_REPOSITORY) private readonly perfisRepository: IPerfisRepository) {}

  async execute(data: CriarPerfilParams) {
    const perfilExistente = await this.perfisRepository.findByNome(data.nome);

    if (perfilExistente) {
      throw new ConflictException('Nome de perfil ja cadastrado');
    }

    try {
      return await this.perfisRepository.create(data);
    } catch (error) {
      // P2002: race condition — dois POSTs simultâneos com mesmo `nome`
      // passam o findByNome e batem na unique constraint do banco.
      handlePrismaError(error, 'Nome de perfil ja cadastrado');
    }
  }
}
