import { NotFoundException, Inject } from '@nestjs/common';
import { IPermissoesRepository, IPERMISSOES_REPOSITORY } from '../../../domain/interfaces/permissoes-repository.interface';

export class DeletarPermissaoUseCase {
  constructor(@Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository) {}

  async execute(id: string) {
    const permissao = await this.permissoesRepository.findById(id);

    if (!permissao) {
      throw new NotFoundException('Permissao nao encontrada');
    }

    await this.permissoesRepository.softDelete(id);
  }
}