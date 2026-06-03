import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const SENHA_MAX_LENGTH = 72;

export class AtualizarUsuarioDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(SENHA_MAX_LENGTH, {
    message: `senha deve ter no máximo ${SENHA_MAX_LENGTH} caracteres`,
  })
  senha?: string;

  @IsOptional()
  @IsUUID()
  perfilId?: string;
}
