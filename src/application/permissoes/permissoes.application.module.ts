import { Module } from '@nestjs/common';
import { CriarPermissaoUseCase } from './usecases/criar-permissao.usecase';
import { ListarPermissoesUseCase } from './usecases/listar-permissoes.usecase';
import { ListarPermissaoPorIdUseCase } from './usecases/listar-permissao-por-id.usecase';
import { AtualizarPermissaoUseCase } from './usecases/atualizar-permissao.usecase';
import { DeletarPermissaoUseCase } from './usecases/deletar-permissao.usecase';
import { PermissoesController } from '../../presentation/permissoes/controllers/permissoes.controller';

@Module({
  providers: [
    CriarPermissaoUseCase,
    ListarPermissoesUseCase,
    ListarPermissaoPorIdUseCase,
    AtualizarPermissaoUseCase,
    DeletarPermissaoUseCase,
    PermissoesController,
  ],
  controllers: [PermissoesController],
  exports: [CriarPermissaoUseCase, ListarPermissoesUseCase, ListarPermissaoPorIdUseCase, AtualizarPermissaoUseCase, DeletarPermissaoUseCase],
})
export class PermissoesModule {}