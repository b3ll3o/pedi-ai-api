import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/database/infrastructure.module';
import { ISENHA_HASH_SERVICE, SenhaHashService } from '../../domain/services/senha-hash.service';
import { IUSUARIOS_REPOSITORY } from '../../domain/interfaces/usuarios-repository.interface';
import { UsuariosRepositoryImpl } from '../../infrastructure/database/prisma/repositories/usuarios-repository.impl';
import { CriarUsuarioUseCase } from './usecases/criar-usuario.usecase';
import { ListarUsuariosUseCase } from './usecases/listar-usuarios.usecase';
import { ListarUsuarioPorIdUseCase } from './usecases/listar-usuario-por-id.usecase';
import { ListarUsuarioPorEmailUseCase } from './usecases/listar-usuario-por-email.usecase';
import { AtualizarUsuarioUseCase } from './usecases/atualizar-usuario.usecase';
import { DeletarUsuarioUseCase } from './usecases/deletar-usuario.usecase';
import { UsuariosController } from '../../presentation/usuarios/controllers/usuarios.controller';
import { AuthModule } from '../../presentation/auth/auth.module';

@Module({
  imports: [InfrastructureModule, AuthModule],
  providers: [
    { provide: IUSUARIOS_REPOSITORY, useClass: UsuariosRepositoryImpl },
    { provide: ISENHA_HASH_SERVICE, useClass: SenhaHashService },
    CriarUsuarioUseCase,
    ListarUsuariosUseCase,
    ListarUsuarioPorIdUseCase,
    ListarUsuarioPorEmailUseCase,
    AtualizarUsuarioUseCase,
    DeletarUsuarioUseCase,
    UsuariosController,
  ],
  controllers: [UsuariosController],
  exports: [
    CriarUsuarioUseCase,
    ListarUsuariosUseCase,
    ListarUsuarioPorIdUseCase,
    ListarUsuarioPorEmailUseCase,
    AtualizarUsuarioUseCase,
    DeletarUsuarioUseCase,
  ],
})
export class UsuariosModule {}
