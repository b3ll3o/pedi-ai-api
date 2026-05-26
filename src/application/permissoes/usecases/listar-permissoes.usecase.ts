import { IPermissoesRepository } from '../../../domain/interfaces/permissoes-repository.interface';

export class ListarPermissoesUseCase {
  constructor(private readonly permissoesRepository: IPermissoesRepository) {}

  async execute() {
    return this.permissoesRepository.findAll();
  }
}