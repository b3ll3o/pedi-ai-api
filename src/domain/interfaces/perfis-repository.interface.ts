import { Perfil, CriarPerfilParams, AtualizarPerfilParams } from '../entities/perfil.entity';
import { Permissao } from '../entities/permissao.entity';

export const IPERFIS_REPOSITORY = 'IPERFIS_REPOSITORY';

export interface IPerfisRepository {
  findById(id: string): Promise<Perfil | null>;
  findByNome(nome: string): Promise<Perfil | null>;
  findAll(): Promise<Perfil[]>;
  create(data: CriarPerfilParams): Promise<Perfil>;
  update(id: string, data: AtualizarPerfilParams): Promise<Perfil>;
  softDelete(id: string): Promise<void>;
  associarPermissoes(id: string, permissoesIds: string[]): Promise<Perfil>;
  desassociarPermissao(id: string, permissaoId: string): Promise<void>;
  findPermissoesByIds(ids: string[]): Promise<Permissao[]>;
}
