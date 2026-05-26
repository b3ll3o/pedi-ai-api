import { Permissao, CriarPermissaoParams, AtualizarPermissaoParams } from '../entities/permissao.entity';

export interface IPermissoesRepository {
  findById(id: string): Promise<Permissao | null>;
  findByNomeOrChave(nome: string, chave: string): Promise<Permissao | null>;
  findAll(): Promise<Permissao[]>;
  create(data: CriarPermissaoParams): Promise<Permissao>;
  update(id: string, data: AtualizarPermissaoParams): Promise<Permissao>;
  softDelete(id: string): Promise<void>;
}