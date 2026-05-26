import { NotFoundException } from '@nestjs/common';
import { IUsuariosRepository } from '../../../domain/interfaces/usuarios-repository.interface';

export class DeletarUsuarioUseCase {
  constructor(private readonly usuariosRepository: IUsuariosRepository) {}

  async execute(id: string) {
    const usuario = await this.usuariosRepository.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    await this.usuariosRepository.softDelete(id);
  }
}