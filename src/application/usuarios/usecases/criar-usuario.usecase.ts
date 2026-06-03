import { ConflictException, Inject } from '@nestjs/common';
import {
  IUsuariosRepository,
  IUSUARIOS_REPOSITORY,
} from '../../../domain/interfaces/usuarios-repository.interface';
import {
  ISenhaHashService,
  ISENHA_HASH_SERVICE,
} from '../../../domain/services/senha-hash.service';
import { CriarUsuarioParams } from '../../../domain/entities/usuario.entity';
import { handlePrismaError } from '../../../common/prisma-errors';

export class CriarUsuarioUseCase {
  constructor(
    @Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository,
    @Inject(ISENHA_HASH_SERVICE) private readonly senhaHashService: ISenhaHashService,
  ) {}

  async execute(data: CriarUsuarioParams) {
    // findByEmailIncludingDeleted cobre tanto emails ativos quanto soft-deletados,
    // alinhando o comportamento de POST /users com POST /auth/register.
    const emailNormalizado = data.email.toLowerCase().trim();
    const usuarioExistente =
      await this.usuariosRepository.findByEmailIncludingDeleted(emailNormalizado);

    if (usuarioExistente) {
      throw new ConflictException('Email ja cadastrado');
    }

    const senhaHashed = await this.senhaHashService.hash(data.senha);

    let usuario: Awaited<ReturnType<IUsuariosRepository['create']>>;
    try {
      usuario = await this.usuariosRepository.create({
        ...data,
        email: emailNormalizado,
        senha: senhaHashed,
      });
    } catch (error) {
      // P2002 (race condition: dois POSTs concorrentes passaram o check-then-create)
      handlePrismaError(error, 'Email ja cadastrado');
    }

    const { senha: _senha, ...resultado } = usuario!;
    return resultado;
  }
}
