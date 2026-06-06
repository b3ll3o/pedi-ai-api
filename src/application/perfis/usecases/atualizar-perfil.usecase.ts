import { ConflictException, NotFoundException, Inject } from '@nestjs/common';
import {
  IPerfisRepository,
  IPERFIS_REPOSITORY,
} from '../../../domain/interfaces/perfis-repository.interface';
import { AtualizarPerfilParams } from '../../../domain/entities/perfil.entity';
import { handlePrismaError } from '../../../common/prisma-errors';

export class AtualizarPerfilUseCase {
  constructor(@Inject(IPERFIS_REPOSITORY) private readonly perfisRepository: IPerfisRepository) {}

  async execute(id: string, data: AtualizarPerfilParams) {
    const perfil = await this.perfisRepository.findById(id);

    if (!perfil) {
      throw new NotFoundException('Perfil nao encontrado');
    }

    if (data.nome) {
      const perfilComNome = await this.perfisRepository.findByNome(data.nome);
      if (perfilComNome && perfilComNome.id !== id) {
        throw new ConflictException('Nome de perfil ja cadastrado');
      }
    }

    try {
      return await this.perfisRepository.update(id, data);
    } catch (error) {
      // P2002: race em rename para nome já em uso.
      // P2025: registro sumiu entre findById e update (delete concorrente).
      handlePrismaError(error, 'Nome de perfil ja cadastrado', 'Perfil nao encontrado');
    }
  }
}
