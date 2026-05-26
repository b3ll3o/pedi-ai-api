import { NotFoundException, Inject } from '@nestjs/common';
import { IUsuariosRepository, IUSUARIOS_REPOSITORY } from '../../../domain/interfaces/usuarios-repository.interface';

export class ListarUsuarioPorEmailUseCase {
  constructor(@Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository) {}

  async execute(email: string) {
    const usuario = await this.usuariosRepository.findByEmail(email);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const { senha, ...resultado } = usuario;
    return resultado;
  }
}