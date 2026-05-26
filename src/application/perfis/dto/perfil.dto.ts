import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CriarPerfilDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class AssociarPermissoesDto {
  @IsNotEmpty()
  permissoesIds: string[];
}
