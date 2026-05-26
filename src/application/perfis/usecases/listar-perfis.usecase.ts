import { Inject } from '@nestjs/common';
import { IPerfisRepository, IPERFIS_REPOSITORY } from '../../../domain/interfaces/perfis-repository.interface';

export class ListarPerfisUseCase {
  constructor(@Inject(IPERFIS_REPOSITORY) private readonly perfisRepository: IPerfisRepository) {}

  async execute() {
    return this.perfisRepository.findAll();
  }
}