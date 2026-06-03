import { IsNotEmpty, IsString, IsOptional, IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

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
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  permissoesIds: string[];
}
