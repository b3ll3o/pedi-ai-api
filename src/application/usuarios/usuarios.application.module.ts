import { Module } from '@nestjs/common';
import { InfrastructureModule, USUARIOS_REPOSITORY } from '../../infrastructure/database/infrastructure.module';
import { ISenhaHashService, SenhaHashService } from '../../domain/services/senha-hash.service';
import { CriarUsuarioUseCase } from './usecases/criar-usuario.usecase';
import { ListarUsuariosUseCase } from './usecases/listar-usuarios.usecase';
import { ListarUsuarioPorIdUseCase } from './usecases/listar-usuario-por-id.usecase';
import { ListarUsuarioPorEmailUseCase } from './usecases/listar-usuario-por-email.usecase';
import { AtualizarUsuarioUseCase } from './usecases/atualizar-usuario.usecase';
import { DeletarUsuarioUseCase } from './usecases/deletar-usuario.usecase';
import { UsuariosController } from '../../presentation/usuarios/controllers/usuarios.controller';

@Module({
  imports: [InfrastructureModule],
  providers: [
    SenhaHashService,
    CriarUsuarioUseCase,
    ListarUsuariosUseCase,
    ListarUsuarioPorIdUseCase,
    ListarUsuarioPorEmailUseCase,
    AtualizarUsuarioUseCase,
    DeletarUsuarioUseCase,
    UsuariosController,
  ],
  controllers: [UsuariosController],
  exports: [CriarUsuarioUseCase, ListarUsuariosUseCase, ListarUsuarioPorIdUseCase, ListarUsuarioPorEmailUseCase, AtualizarUsuarioUseCase, DeletarUsuarioUseCase],
})
export class UsuariosModule {}