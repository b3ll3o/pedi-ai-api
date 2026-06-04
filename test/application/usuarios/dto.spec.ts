import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CriarUsuarioDto } from '../../../src/application/usuarios/dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../../../src/application/usuarios/dto/atualizar-usuario.dto';

describe('Usuarios DTOs', () => {
  describe('CriarUsuarioDto', () => {
    it('deve passar com dados válidos', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: 'senha123',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve normalizar email (lowercase + trim)', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: '  TESTE@EXEMPLO.COM  ',
        senha: 'senha123',
      });
      expect(dto.email).toBe('teste@exemplo.com');
    });

    it('deve falhar com email inválido', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: 'invalido',
        senha: 'senha123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('deve falhar com email vazio', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: '',
        senha: 'senha123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar com nome vazio', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: '',
        email: 'valido@exemplo.com',
        senha: 'senha123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'nome')).toBe(true);
    });

    it('deve falhar com nome não-string', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 123,
        email: 'valido@exemplo.com',
        senha: 'senha123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar com senha menor que 6 caracteres', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: 'valido@exemplo.com',
        senha: '12345',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'senha')).toBe(true);
    });

    it('deve falhar com senha maior que 72 caracteres', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: 'valido@exemplo.com',
        senha: 'a'.repeat(73),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'senha')).toBe(true);
    });

    it('deve aceitar perfilId opcional válido (UUID)', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: 'valido@exemplo.com',
        senha: 'senha123',
        perfilId: '550e8400-e29b-41d4-a716-446655440000',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve falhar com perfilId inválido (não-UUID)', async () => {
      const dto = plainToInstance(CriarUsuarioDto, {
        nome: 'Usuario',
        email: 'valido@exemplo.com',
        senha: 'senha123',
        perfilId: 'nao-eh-uuid',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'perfilId')).toBe(true);
    });
  });

  describe('AtualizarUsuarioDto', () => {
    it('deve passar com objeto vazio (todos os campos opcionais)', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve passar com apenas nome', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { nome: 'Novo Nome' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve normalizar email ao atualizar', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { email: '  NOVO@EXEMPLO.COM  ' });
      expect(dto.email).toBe('novo@exemplo.com');
    });

    it('deve falhar com email inválido', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { email: 'invalido' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('deve falhar com senha menor que 6 caracteres', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { senha: '123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'senha')).toBe(true);
    });

    it('deve falhar com senha maior que 72 caracteres', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { senha: 'a'.repeat(73) });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar com nome não-string', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { nome: 123 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar com perfilId não-UUID', async () => {
      const dto = plainToInstance(AtualizarUsuarioDto, { perfilId: 'nao-eh-uuid' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
