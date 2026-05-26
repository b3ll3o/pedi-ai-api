export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfilId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  version: number;
}

export interface CriarUsuarioParams {
  nome: string;
  email: string;
  senha: string;
  perfilId?: string;
}

export interface AtualizarUsuarioParams {
  nome?: string;
  email?: string;
  senha?: string;
  perfilId?: string;
}
