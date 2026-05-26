import { NotFoundException } from '@nestjs/common';
import { IPerfisRepository } from '../../../domain/interfaces/perfis-repository.interface';

export class ListarPerfilPorIdUseCase {
  constructor(private readonly perfisRepository: IPerfisRepository) {}

  async execute(id: string) {
    const perfil = await this.perfisRepository.findById(id);

    if (!perfil) {
      throw new NotFoundException('Perfil nao encontrado');
    }

    return perfil;
  }
}