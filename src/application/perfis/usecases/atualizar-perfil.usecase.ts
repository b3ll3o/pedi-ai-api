import { ConflictException, NotFoundException } from '@nestjs/common';
import { IPerfisRepository } from '../../../domain/interfaces/perfis-repository.interface';
import { AtualizarPerfilParams } from '../../../domain/entities/perfil.entity';

export class AtualizarPerfilUseCase {
  constructor(private readonly perfisRepository: IPerfisRepository) {}

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

    const atualizado = await this.perfisRepository.update(id, data);
    return atualizado;
  }
}