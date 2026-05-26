import { Inject } from '@nestjs/common';
import { IUsuariosRepository, IUSUARIOS_REPOSITORY } from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuariosUseCase {
  constructor(@Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository) {}

  async execute() {
    const usuarios = await this.usuariosRepository.findAll();
    return usuarios.map(({ senha, ...resultado }) => resultado);
  }
}