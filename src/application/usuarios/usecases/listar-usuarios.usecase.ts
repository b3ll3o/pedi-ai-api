import { Inject } from '@nestjs/common';
import {
  IUsuariosRepository,
  IUSUARIOS_REPOSITORY,
} from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuariosUseCase {
  constructor(
    @Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository,
  ) {}

  async execute(params?: { skip?: number; take?: number }) {
    const usuarios = await this.usuariosRepository.findAll(params);
    return usuarios.map(({ senha: _senha, ...resultado }) => resultado);
  }
}
