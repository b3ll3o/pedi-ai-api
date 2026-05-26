import { NotFoundException } from '@nestjs/common';
import { IUsuariosRepository } from '../../../domain/interfaces/usuarios-repository.interface';
import { ISenhaHashService } from '../../../domain/services/senha-hash.service';
import { AtualizarUsuarioParams } from '../../../domain/entities/usuario.entity';

export class AtualizarUsuarioUseCase {
  constructor(
    private readonly usuariosRepository: IUsuariosRepository,
    private readonly senhaHashService: ISenhaHashService,
  ) {}

  async execute(id: string, data: AtualizarUsuarioParams) {
    const usuario = await this.usuariosRepository.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const updateData: any = { ...data };

    if (data.senha) {
      updateData.senha = await this.senhaHashService.hash(data.senha);
    }

    const atualizado = await this.usuariosRepository.update(id, updateData);

    const { senha, ...resultado } = atualizado;
    return resultado;
  }
}