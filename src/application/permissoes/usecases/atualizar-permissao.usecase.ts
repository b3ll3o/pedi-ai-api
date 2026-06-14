import { ConflictException, NotFoundException, Inject } from '@nestjs/common';
import {
  IPermissoesRepository,
  IPERMISSOES_REPOSITORY,
} from '../../../domain/interfaces/permissoes-repository.interface';
import { AtualizarPermissaoParams } from '../../../domain/entities/permissao.entity';
import { handlePrismaError } from '../../../common/prisma-errors';

export class AtualizarPermissaoUseCase {
  constructor(
    @Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository,
  ) {}

  async execute(id: string, data: AtualizarPermissaoParams) {
    const permissao = await this.permissoesRepository.findById(id);

    if (!permissao) {
      throw new NotFoundException('Permissao nao encontrada');
    }

    // `!== undefined` em vez de `||` permite explicitamente o caso `data.nome = ''`
    // sem curto-circuitar e acabar caindo no `permissao.nome` antigo (que mascararia
    // o conflito e gravaria string vazia no banco).
    const nomeEfetivo = data.nome !== undefined ? data.nome : permissao.nome;
    const chaveEfetiva = data.chave !== undefined ? data.chave : permissao.chave;

    if (data.nome !== undefined || data.chave !== undefined) {
      const permissaoExistente = await this.permissoesRepository.findByNomeOrChave(
        nomeEfetivo,
        chaveEfetiva,
      );

      if (permissaoExistente && permissaoExistente.id !== id) {
        if (data.nome !== undefined && permissaoExistente.nome === data.nome) {
          throw new ConflictException('Nome de permissao ja cadastrado');
        }
        if (data.chave !== undefined && permissaoExistente.chave === data.chave) {
          throw new ConflictException('Chave de permissao ja cadastrada');
        }
      }
    }

    try {
      return await this.permissoesRepository.update(id, data);
    } catch (error) {
      // P2002: race em rename; P2025: delete concorrente.
      handlePrismaError(
        error,
        'Nome ou chave de permissao ja cadastrada',
        'Permissao nao encontrada',
      );
    }
  }
}
