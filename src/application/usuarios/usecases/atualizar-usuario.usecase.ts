import { NotFoundException, ConflictException, Inject } from '@nestjs/common';
import {
  IUsuariosRepository,
  IUSUARIOS_REPOSITORY,
} from '../../../domain/interfaces/usuarios-repository.interface';
import {
  ISenhaHashService,
  ISENHA_HASH_SERVICE,
} from '../../../domain/services/senha-hash.service';
import { AtualizarUsuarioParams } from '../../../domain/entities/usuario.entity';
import { handlePrismaError } from '../../../common/prisma-errors';

export class AtualizarUsuarioUseCase {
  constructor(
    @Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository,
    @Inject(ISENHA_HASH_SERVICE) private readonly senhaHashService: ISenhaHashService,
  ) {}

  async execute(id: string, data: AtualizarUsuarioParams) {
    const usuario = await this.usuariosRepository.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (data.email && data.email !== usuario.email) {
      const emailNormalizado = data.email.toLowerCase().trim();
      const colisao = await this.usuariosRepository.findByEmailIncludingDeleted(emailNormalizado);
      if (colisao && colisao.id !== id) {
        throw new ConflictException('Email ja cadastrado');
      }
      data.email = emailNormalizado;
    }

    const updateData: AtualizarUsuarioParams = { ...data };

    if (data.senha) {
      updateData.senha = await this.senhaHashService.hash(data.senha);
    }

    let atualizado: Awaited<ReturnType<IUsuariosRepository['update']>>;
    try {
      atualizado = await this.usuariosRepository.update(id, updateData);
    } catch (error) {
      handlePrismaError(error, 'Email ja cadastrado', 'Usuario nao encontrado');
    }

    const { senha: _senha, ...resultado } = atualizado!;
    return resultado;
  }
}
