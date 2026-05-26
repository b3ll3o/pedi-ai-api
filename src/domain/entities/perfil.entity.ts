import { Permissao } from './permissao.entity';

export interface Perfil {
  id: string;
  nome: string;
  descricao?: string;
  permissoes: Permissao[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  version: number;
}

export interface CriarPerfilParams {
  nome: string;
  descricao?: string;
}

export interface AtualizarPerfilParams {
  nome?: string;
  descricao?: string;
}