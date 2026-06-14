import { IsEmail, IsString, MaxLength } from 'class-validator';

// bcrypt trunca silenciosamente em 72 bytes; limite superior evita que um
// payload gigante force hash de prefixo arbitrariamente escolhido.
const SENHA_MAX_LENGTH = 72;

export class LoginDto {
  @IsEmail({}, { message: 'email deve ser um email válido' })
  email: string;

  // Sem @MinLength aqui: a regra de "senha >= 6" é responsabilidade do registro
  // e da validação no AuthService.login (que compara contra bcrypt). No login
  // a senha é checada por hash: devolver 400 antes do bcrypt por uma senha
  // curta vazaria que o EMAIL existe (a resposta 400 sai antes do lookup,
  // enquanto usuário inexistente + senha qualquer gera 401 depois do bcrypt
  // dummy). Mantendo só o limite superior, o caminho de erro é uniforme.
  @IsString()
  @MaxLength(SENHA_MAX_LENGTH, {
    message: `senha deve ter no máximo ${SENHA_MAX_LENGTH} caracteres`,
  })
  senha: string;
}
