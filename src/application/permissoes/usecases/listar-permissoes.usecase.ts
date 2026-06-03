import { Inject } from '@nestjs/common';
import {
  IPermissoesRepository,
  IPERMISSOES_REPOSITORY,
} from '../../../domain/interfaces/permissoes-repository.interface';

export class ListarPermissoesUseCase {
  constructor(
    @Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository,
  ) {}

  async execute(params?: { skip?: number; take?: number }) {
    return this.permissoesRepository.findAll(params);
  }
}
