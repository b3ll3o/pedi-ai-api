import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

// bcrypt trunca silenciosamente em 72 bytes. Sem MaxLength, o cliente pode
// enviar uma senha de 1MB e ter o hash computado sobre os primeiros 72 bytes
// — colisão automática com qualquer senha que compartilhe esse prefixo.
const SENHA_MAX_LENGTH = 72;

export class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'email deve ser um email válido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsString()
  @MinLength(6, { message: 'senha deve ter pelo menos 6 caracteres' })
  @MaxLength(SENHA_MAX_LENGTH, {
    message: `senha deve ter no máximo ${SENHA_MAX_LENGTH} caracteres`,
  })
  senha: string;
}
