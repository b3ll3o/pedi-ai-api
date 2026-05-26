import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CriarPermissaoDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-z]+:[a-z0-9]+$/, {
    message: 'Chave deve estar no formato "recurso:acao"',
  })
  chave: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class AtualizarPermissaoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z]+:[a-z0-9]+$/, {
    message: 'Chave deve estar no formato "recurso:acao"',
  })
  chave?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
