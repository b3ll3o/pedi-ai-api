import { Inject } from '@nestjs/common';
import {
  IPermissoesRepository,
  IPERMISSOES_REPOSITORY,
} from '../../../domain/interfaces/permissoes-repository.interface';

export class ContarPermissoesUseCase {
  constructor(
    @Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository,
  ) {}

  async execute(): Promise<number> {
    return this.permissoesRepository.count();
  }
}
