import { ConflictException, NotFoundException } from '@nestjs/common';
import { IUsuariosRepository } from '../../../domain/interfaces/usuarios-repository.interface';
import { ISenhaHashService } from '../../../domain/services/senha-hash.service';
import { CriarUsuarioParams } from '../../../domain/entities/usuario.entity';

export class CriarUsuarioUseCase {
  constructor(
    private readonly usuariosRepository: IUsuariosRepository,
    private readonly senhaHashService: ISenhaHashService,
  ) {}

  async execute(data: CriarUsuarioParams) {
    const usuarioExistente = await this.usuariosRepository.findByEmail(data.email);

    if (usuarioExistente) {
      throw new ConflictException('Email ja cadastrado');
    }

    const senhaHashed = await this.senhaHashService.hash(data.senha);

    const usuario = await this.usuariosRepository.create({
      ...data,
      senha: senhaHashed,
    });

    const { senha: _, ...resultado } = usuario;
    return resultado;
  }
}