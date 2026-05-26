import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/database/infrastructure.module';
import { IPerfisRepository, IPERFIS_REPOSITORY } from '../../domain/interfaces/perfis-repository.interface';
import { PerfisRepositoryImpl } from '../../infrastructure/database/prisma/repositories/perfis-repository.impl';
import { CriarPerfilUseCase } from './usecases/criar-perfil.usecase';
import { ListarPerfisUseCase } from './usecases/listar-perfis.usecase';
import { ListarPerfilPorIdUseCase } from './usecases/listar-perfil-por-id.usecase';
import { AtualizarPerfilUseCase } from './usecases/atualizar-perfil.usecase';
import { DeletarPerfilUseCase } from './usecases/deletar-perfil.usecase';
import { AssociarPermissoesPerfilUseCase } from './usecases/associar-permissoes-perfil.usecase';
import { DesassociarPermissaoPerfilUseCase } from './usecases/desassociar-permissao-perfil.usecase';
import { PerfisController } from '../../presentation/perfis/controllers/perfis.controller';

@Module({
  imports: [InfrastructureModule],
  providers: [
    { provide: IPERFIS_REPOSITORY, useClass: PerfisRepositoryImpl },
    CriarPerfilUseCase,
    ListarPerfisUseCase,
    ListarPerfilPorIdUseCase,
    AtualizarPerfilUseCase,
    DeletarPerfilUseCase,
    AssociarPermissoesPerfilUseCase,
    DesassociarPermissaoPerfilUseCase,
    PerfisController,
  ],
  controllers: [PerfisController],
  exports: [CriarPerfilUseCase, ListarPerfisUseCase, ListarPerfilPorIdUseCase, AtualizarPerfilUseCase, DeletarPerfilUseCase, AssociarPermissoesPerfilUseCase, DesassociarPermissaoPerfilUseCase],
})
export class PerfisModule {}