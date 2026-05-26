import { Usuario, CriarUsuarioParams, AtualizarUsuarioParams } from '../entities/usuario.entity';

export const IUSUARIOS_REPOSITORY = 'IUSUARIOS_REPOSITORY';

export interface IUsuariosRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  create(data: CriarUsuarioParams): Promise<Usuario>;
  update(id: string, data: AtualizarUsuarioParams): Promise<Usuario>;
  softDelete(id: string): Promise<void>;
}