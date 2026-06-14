import { Inject } from '@nestjs/common';
import {
  IPerfisRepository,
  IPERFIS_REPOSITORY,
} from '../../../domain/interfaces/perfis-repository.interface';

export class ContarPerfisUseCase {
  constructor(@Inject(IPERFIS_REPOSITORY) private readonly perfisRepository: IPerfisRepository) {}

  async execute(): Promise<number> {
    return this.perfisRepository.count();
  }
}
