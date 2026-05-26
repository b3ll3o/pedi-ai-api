import { NotFoundException } from '@nestjs/common';
import { IPerfisRepository } from '../../../domain/interfaces/perfis-repository.interface';

export class AssociarPermissoesPerfilUseCase {
  constructor(private readonly perfisRepository: IPerfisRepository) {}

  async execute(id: string, permissoesIds: string[]) {
    const perfil = await this.perfisRepository.findById(id);

    if (!perfil) {
      throw new NotFoundException('Perfil nao encontrado');
    }

    const permissoes = await this.perfisRepository.findPermissoesByIds(permissoesIds);

    if (permissoes.length !== permissoesIds.length) {
      throw new NotFoundException('Uma ou mais permissoes nao foram encontradas');
    }

    const atualizado = await this.perfisRepository.associarPermissoes(id, permissoesIds);
    return atualizado;
  }
}