import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/database/infrastructure.module';
import { IPERMISSOES_REPOSITORY } from '../../domain/interfaces/permissoes-repository.interface';
import { PermissoesRepositoryImpl } from '../../infrastructure/database/prisma/repositories/permissoes-repository.impl';
import { CriarPermissaoUseCase } from './usecases/criar-permissao.usecase';
import { ListarPermissoesUseCase } from './usecases/listar-permissoes.usecase';
import { ListarPermissaoPorIdUseCase } from './usecases/listar-permissao-por-id.usecase';
import { AtualizarPermissaoUseCase } from './usecases/atualizar-permissao.usecase';
import { DeletarPermissaoUseCase } from './usecases/deletar-permissao.usecase';
import { ContarPermissoesUseCase } from './usecases/contar-permissoes.usecase';
import { PermissoesController } from '../../presentation/permissoes/controllers/permissoes.controller';
import { AuthModule } from '../../presentation/auth/auth.module';

@Module({
  imports: [InfrastructureModule, AuthModule],
  providers: [
    { provide: IPERMISSOES_REPOSITORY, useClass: PermissoesRepositoryImpl },
    CriarPermissaoUseCase,
    ListarPermissoesUseCase,
    ListarPermissaoPorIdUseCase,
    AtualizarPermissaoUseCase,
    DeletarPermissaoUseCase,
    ContarPermissoesUseCase,
    PermissoesController,
  ],
  controllers: [PermissoesController],
  exports: [
    CriarPermissaoUseCase,
    ListarPermissoesUseCase,
    ListarPermissaoPorIdUseCase,
    AtualizarPermissaoUseCase,
    DeletarPermissaoUseCase,
    ContarPermissoesUseCase,
  ],
})
export class PermissoesModule {}
