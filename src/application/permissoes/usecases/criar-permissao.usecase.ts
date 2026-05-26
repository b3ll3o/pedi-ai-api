import { ConflictException, Inject } from '@nestjs/common';
import { IPermissoesRepository, IPERMISSOES_REPOSITORY } from '../../../domain/interfaces/permissoes-repository.interface';
import { CriarPermissaoParams } from '../../../domain/entities/permissao.entity';

export class CriarPermissaoUseCase {
  constructor(@Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository) {}

  async execute(data: CriarPermissaoParams) {
    const permissaoExistente = await this.permissoesRepository.findByNomeOrChave(
      data.nome,
      data.chave,
    );

    if (permissaoExistente) {
      if (permissaoExistente.nome === data.nome) {
        throw new ConflictException('Nome de permissao ja cadastrado');
      }
      throw new ConflictException('Chave de permissao ja cadastrada');
    }

    const permissao = await this.permissoesRepository.create(data);
    return permissao;
  }
}