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
    // Verifica nome e chave em paralelo: findByNomeOrChave só retorna um
    // registro (findFirst), então se ambos colidirem em registros DIFERENTES,
    // só vemos o primeiro. Por isso checamos os dois em paralelo — se a
    // colisão for só no nome, a chamada por chave retorna null, e vice-versa.
    // Usa `!== undefined` em vez de `if (data.nome)`: o `||`/truthy original
    // curto-circuitava em string vazia ('' é falsy) e silenciosamente deixava
    // o nome passar pela checagem — mesmo bug que o atualizar-permissao
    // acabou de corrigir. Aqui a colisão em '' produziria P2002 genérico
    // em vez do "Nome de permissao ja cadastrado" específico.
    const [porNome, porChave] = await Promise.all([
      data.nome !== undefined
        ? this.permissoesRepository.findByNomeOrChave(data.nome, '__never_matches__')
        : Promise.resolve(null),
      data.chave !== undefined
        ? this.permissoesRepository.findByNomeOrChave('__never_matches__', data.chave)
        : Promise.resolve(null),
    ]);

    if (porNome) {
      throw new ConflictException('Nome de permissao ja cadastrado');
    }
    if (porChave) {
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
