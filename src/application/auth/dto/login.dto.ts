import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email deve ser um email válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'senha deve ter pelo menos 6 caracteres' })
  senha: string;
}
