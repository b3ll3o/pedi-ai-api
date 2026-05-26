import { ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { IPermissoesRepository, IPERMISSOES_REPOSITORY } from '../../../domain/interfaces/permissoes-repository.interface';
import { AtualizarPermissaoParams } from '../../../domain/entities/permissao.entity';

export class AtualizarPermissaoUseCase {
  constructor(@Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository) {}

  async execute(id: string, data: AtualizarPermissaoParams) {
    const permissao = await this.permissoesRepository.findById(id);

    if (!permissao) {
      throw new NotFoundException('Permissao nao encontrada');
    }

    if (data.nome || data.chave) {
      const permissaoExistente = await this.permissoesRepository.findByNomeOrChave(
        data.nome || permissao.nome,
        data.chave || permissao.chave,
      );

      if (permissaoExistente && permissaoExistente.id !== id) {
        if (data.nome && permissaoExistente.nome === data.nome) {
          throw new ConflictException('Nome de permissao ja cadastrado');
        }
        if (data.chave && permissaoExistente.chave === data.chave) {
          throw new ConflictException('Chave de permissao ja cadastrada');
        }
      }
    }

    const atualizado = await this.permissoesRepository.update(id, data);
    return atualizado;
  }
}