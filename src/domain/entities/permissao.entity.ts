export interface Permissao {
  id: string;
  nome: string;
  chave: string;
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  version: number;
}

export interface CriarPermissaoParams {
  nome: string;
  chave: string;
  descricao?: string;
}

export interface AtualizarPermissaoParams {
  nome?: string;
  chave?: string;
  descricao?: string;
}