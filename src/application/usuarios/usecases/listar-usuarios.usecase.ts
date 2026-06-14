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
    // O `select` no repositório já exclui `senha` do payload de DB,
    // mas mantemos a desestruturação como defesa em profundidade: se um
    // repositório futuro voltar a trazer o campo por mudança de schema,
    // ainda assim o caller externo não vaza o hash.
    const usuarios = await this.usuariosRepository.findAll(params);
    return usuarios.map(({ senha: _senha, ...resultado }) => resultado);
  }
}
