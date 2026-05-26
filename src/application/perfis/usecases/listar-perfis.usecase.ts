import { IPerfisRepository } from '../../../domain/interfaces/perfis-repository.interface';

export class ListarPerfisUseCase {
  constructor(private readonly perfisRepository: IPerfisRepository) {}

  async execute() {
    return this.perfisRepository.findAll();
  }
}