import { ConflictException } from '@nestjs/common';
import { IPerfisRepository } from '../../../domain/interfaces/perfis-repository.interface';
import { CriarPerfilParams } from '../../../domain/entities/perfil.entity';

export class CriarPerfilUseCase {
  constructor(private readonly perfisRepository: IPerfisRepository) {}

  async execute(data: CriarPerfilParams) {
    const perfilExistente = await this.perfisRepository.findByNome(data.nome);

    if (perfilExistente) {
      throw new ConflictException('Nome de perfil ja cadastrado');
    }

    const perfil = await this.perfisRepository.create(data);
    return perfil;
  }
}