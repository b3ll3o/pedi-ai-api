export const IRESTAURANTES_REPOSITORY = 'IRESTAURANTES_REPOSITORY';

export interface CreateRestauranteInput {
  nome: string;
  cnpj: string;
  email?: string | null;
  telefone?: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioAbertura: string;
  horarioFechamento: string;
}

export interface UpdateRestauranteInput {
  nome?: string;
  email?: string | null;
  telefone?: string | null;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
  ativo?: boolean;
}

export interface Restaurante {
  id: string;
  nome: string;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioAbertura: string;
  horarioFechamento: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
}

export interface IRestaurantesRepository {
  create(data: CreateRestauranteInput): Promise<Restaurante>;
  findAll(params?: { skip?: number; take?: number }): Promise<Restaurante[]>;
  count(): Promise<number>;
  findById(id: string): Promise<Restaurante | null>;
  findByCnpj(cnpj: string): Promise<Restaurante | null>;
  update(id: string, data: UpdateRestauranteInput): Promise<Restaurante>;
  softDelete(id: string): Promise<void>;
}
