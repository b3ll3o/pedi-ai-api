import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// bcrypt trunca silenciosamente em 72 bytes; limite superior evita que um
// payload gigante force hash de prefixo arbitrariamente escolhido.
const SENHA_MAX_LENGTH = 72;

export class LoginDto {
  @IsEmail({}, { message: 'email deve ser um email válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'senha deve ter pelo menos 6 caracteres' })
  @MaxLength(SENHA_MAX_LENGTH, {
    message: `senha deve ter no máximo ${SENHA_MAX_LENGTH} caracteres`,
  })
  senha: string;
}
