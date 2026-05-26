import { NotFoundException } from '@nestjs/common';
import { IUsuariosRepository } from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuarioPorIdUseCase {
  constructor(private readonly usuariosRepository: IUsuariosRepository) {}

  async execute(id: string) {
    const usuario = await this.usuariosRepository.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { senha, ...resultado } = usuario;
    return resultado;
  }
}