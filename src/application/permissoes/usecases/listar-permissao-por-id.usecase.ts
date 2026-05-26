import { NotFoundException } from '@nestjs/common';
import { IPermissoesRepository } from '../../../domain/interfaces/permissoes-repository.interface';

export class ListarPermissaoPorIdUseCase {
  constructor(private readonly permissoesRepository: IPermissoesRepository) {}

  async execute(id: string) {
    const permissao = await this.permissoesRepository.findById(id);

    if (!permissao) {
      throw new NotFoundException('Permissao nao encontrada');
    }

    return permissao;
  }
}