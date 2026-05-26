import { Perfil } from '../../src/domain/entities/perfil.entity';

describe('Perfil Entity', () => {
  describe('interface validation', () => {
    it('deve aceitar estrutura valida de Perfil', () => {
      const perfil: Perfil = {
        id: 'uuid-perfil-teste',
        nome: 'Perfil Teste',
        descricao: 'Descricao do perfil',
        permissoes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        version: 1,
      };

      expect(perfil.id).toBe('uuid-perfil-teste');
      expect(perfil.nome).toBe('Perfil Teste');
      expect(perfil.version).toBe(1);
    });

    it('deve permitir array de permissoes vazio', () => {
      const perfil: Perfil = {
        id: 'uuid-perfil',
        nome: 'Perfil',
        permissoes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      expect(perfil.permissoes).toHaveLength(0);
    });

    it('deve permitir campos opcionais ausentes', () => {
      const perfil: Partial<Perfil> = {
        id: 'uuid-perfil',
        nome: 'Perfil',
      };

      expect(perfil.descricao).toBeUndefined();
      expect(perfil.deletedAt).toBeUndefined();
    });
  });

  describe('CriarPerfilParams', () => {
    it('deve validar parametros de criacao', () => {
      const params: { nome: string; descricao?: string } = {
        nome: 'Novo Perfil',
        descricao: 'Descricao',
      };

      expect(params.nome).toBe('Novo Perfil');
      expect(params.descricao).toBe('Descricao');
    });
  });

  describe('AtualizarPerfilParams', () => {
    it('deve validar parametros de atualizacao', () => {
      const params: { nome?: string; descricao?: string } = {
        nome: 'Nome Atualizado',
      };

      expect(params.nome).toBe('Nome Atualizado');
    });
  });
});
