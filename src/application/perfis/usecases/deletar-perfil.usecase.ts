import { NotFoundException, Inject } from '@nestjs/common';
import {
  IPerfisRepository,
  IPERFIS_REPOSITORY,
} from '../../../domain/interfaces/perfis-repository.interface';

export class DeletarPerfilUseCase {
  constructor(@Inject(IPERFIS_REPOSITORY) private readonly perfisRepository: IPerfisRepository) {}

  async execute(id: string) {
    const perfil = await this.perfisRepository.findById(id);

    if (!perfil) {
      throw new NotFoundException('Perfil nao encontrado');
    }

    await this.perfisRepository.softDelete(id);
  }
}
