import { ConflictException, Inject } from '@nestjs/common';
import {
  IUsuariosRepository,
  IUSUARIOS_REPOSITORY,
} from '../../../domain/interfaces/usuarios-repository.interface';
import {
  ISenhaHashService,
  ISENHA_HASH_SERVICE,
} from '../../../domain/services/senha-hash.service';
import { CriarUsuarioParams } from '../../../domain/entities/usuario.entity';

export class CriarUsuarioUseCase {
  constructor(
    @Inject(IUSUARIOS_REPOSITORY) private readonly usuariosRepository: IUsuariosRepository,
    @Inject(ISENHA_HASH_SERVICE) private readonly senhaHashService: ISenhaHashService,
  ) {}

  async execute(data: CriarUsuarioParams) {
    const usuarioExistente = await this.usuariosRepository.findByEmail(data.email);

    if (usuarioExistente) {
      throw new ConflictException('Email ja cadastrado');
    }

    const senhaHashed = await this.senhaHashService.hash(data.senha);

    const usuario = await this.usuariosRepository.create({
      ...data,
      senha: senhaHashed,
    });

    const { senha: _senha, ...resultado } = usuario;
    return resultado;
  }
}
