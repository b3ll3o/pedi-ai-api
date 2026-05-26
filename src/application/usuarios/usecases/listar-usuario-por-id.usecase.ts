import { NotFoundException, Inject } from '@nestjs/common';
import { IUsuariosRepository, IUSUARIOS_REPOSITORY } from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuarioPorIdUseCase {
  constructor(@Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository) {}

  async execute(id: string) {
    const usuario = await this.usuariosRepository.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { senha, ...resultado } = usuario;
    return resultado;
  }
}