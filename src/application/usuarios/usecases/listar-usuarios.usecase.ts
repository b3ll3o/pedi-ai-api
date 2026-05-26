import { IUsuariosRepository } from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuariosUseCase {
  constructor(private readonly usuariosRepository: IUsuariosRepository) {}

  async execute() {
    const usuarios = await this.usuariosRepository.findAll();
    return usuarios.map(({ senha, ...resultado }) => resultado);
  }
}