import { ConflictException, Inject } from '@nestjs/common';
import {
  IPermissoesRepository,
  IPERMISSOES_REPOSITORY,
} from '../../../domain/interfaces/permissoes-repository.interface';
import { CriarPermissaoParams } from '../../../domain/entities/permissao.entity';
import { handlePrismaError } from '../../../common/prisma-errors';

export class CriarPermissaoUseCase {
  constructor(
    @Inject(IPERMISSOES_REPOSITORY) private readonly permissoesRepository: IPermissoesRepository,
  ) {}

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

    try {
      return await this.permissoesRepository.create(data);
    } catch (error) {
      // P2002: race condition — duas inserções simultâneas com mesmo nome/chave
      // passam o findByNomeOrChave e batem na unique constraint.
      handlePrismaError(error, 'Nome ou chave de permissao ja cadastrada');
    }
  }
}
