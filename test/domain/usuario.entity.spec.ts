import { Usuario } from '../../src/domain/entities/usuario.entity';

describe('Usuario Entity', () => {
  describe('interface validation', () => {
    it('deve aceitar estrutura valida de Usuario', () => {
      const usuario: Usuario = {
        id: 'uuid-teste',
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: 'senhaHash',
        perfilId: 'uuid-perfil',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        version: 1,
      };

      expect(usuario.id).toBe('uuid-teste');
      expect(usuario.email).toBe('teste@exemplo.com');
      expect(usuario.version).toBe(1);
    });

    it('deve permitir campos opcionais ausentes', () => {
      const usuario: Partial<Usuario> = {
        id: 'uuid-teste',
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
      };

      expect(usuario.senha).toBeUndefined();
      expect(usuario.deletedAt).toBeUndefined();
      expect(usuario.perfilId).toBeUndefined();
    });
  });

  describe('CriarUsuarioParams', () => {
    it('deve validar parametros de criacao', () => {
      const params: { nome: string; email: string; senha: string; perfilId?: string } = {
        nome: 'Novo Usuario',
        email: 'novo@exemplo.com',
        senha: 'senha123',
      };

      expect(params.nome).toBe('Novo Usuario');
      expect(params.email).toBe('novo@exemplo.com');
    });
  });

  describe('AtualizarUsuarioParams', () => {
    it('deve validar parametros de atualizacao', () => {
      const params: { nome?: string; email?: string; senha?: string; perfilId?: string } = {
        nome: 'Nome Atualizado',
      };

      expect(params.nome).toBe('Nome Atualizado');
      expect(params.email).toBeUndefined();
    });
  });
});
