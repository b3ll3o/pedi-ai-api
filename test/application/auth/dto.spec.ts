import { LoginDto } from '../../../src/application/auth/dto/login.dto';
import { RefreshTokenDto } from '../../../src/application/auth/dto/refresh-token.dto';
import { TokenResponseDto } from '../../../src/application/auth/dto/token-response.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('Auth DTOs', () => {
  describe('LoginDto', () => {
    it('should pass with valid email and password', async () => {
      const dto = plainToInstance(LoginDto, { email: 'test@test.com', senha: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid email', async () => {
      const dto = plainToInstance(LoginDto, { email: 'invalid-email', senha: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should pass with short password (no MinLength — checked via bcrypt, not DTO)', async () => {
      // Senha curta é responsabilidade do registro e do bcrypt.compare no
      // AuthService.login. Tirar o @MinLength do LoginDto é proposital: o
      // caminho de erro fica uniforme (sempre 401) sem vazar existência de
      // email via 400 vs 401.
      const dto = plainToInstance(LoginDto, { email: 'test@test.com', senha: '123' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with password longer than bcrypt max (72 bytes)', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@test.com',
        senha: 'a'.repeat(73),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('senha');
    });

    it('should fail with empty email', async () => {
      const dto = plainToInstance(LoginDto, { email: '', senha: 'password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with missing fields', async () => {
      const dto = plainToInstance(LoginDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
    });
  });

  describe('RefreshTokenDto', () => {
    it('should pass with valid refresh token', async () => {
      const dto = plainToInstance(RefreshTokenDto, { refreshToken: 'valid-token' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty refresh token', async () => {
      const dto = plainToInstance(RefreshTokenDto, { refreshToken: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('TokenResponseDto', () => {
    it('should have correct structure', () => {
      const dto = new TokenResponseDto();
      dto.accessToken = 'access-token';
      dto.refreshToken = 'refresh-token';
      dto.expiresIn = 900;
      dto.tokenType = 'Bearer';

      expect(dto.accessToken).toBe('access-token');
      expect(dto.refreshToken).toBe('refresh-token');
      expect(dto.expiresIn).toBe(900);
      expect(dto.tokenType).toBe('Bearer');
    });
  });
});
