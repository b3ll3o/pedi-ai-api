import { NotFoundException } from '@nestjs/common';
import { IUsuariosRepository } from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuarioPorEmailUseCase {
  constructor(private readonly usuariosRepository: IUsuariosRepository) {}

  async execute(email: string) {
    const usuario = await this.usuariosRepository.findByEmail(email);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { senha, ...resultado } = usuario;
    return resultado;
  }
}