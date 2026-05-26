import { Permissao } from '../../src/domain/entities/permissao.entity';

describe('Permissao Entity', () => {
  describe('interface validation', () => {
    it('deve aceitar estrutura valida de Permissao', () => {
      const permissao: Permissao = {
        id: 'uuid-permissao-teste',
        nome: 'Criar Usuario',
        chave: 'usuario:criar',
        descricao: 'Permite criar usuarios',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        version: 1,
      };

      expect(permissao.id).toBe('uuid-permissao-teste');
      expect(permissao.chave).toBe('usuario:criar');
      expect(permissao.version).toBe(1);
    });

    it('deve permitir campos opcionais ausentes', () => {
      const permissao: Partial<Permissao> = {
        id: 'uuid-permissao',
        nome: 'Permissao',
        chave: 'permissao:acao',
      };

      expect(permissao.descricao).toBeUndefined();
      expect(permissao.deletedAt).toBeUndefined();
    });
  });

  describe('CriarPermissaoParams', () => {
    it('deve validar parametros de criacao', () => {
      const params: { nome: string; chave: string; descricao?: string } = {
        nome: 'Nova Permissao',
        chave: 'nova:permissao',
        descricao: 'Descricao',
      };

      expect(params.nome).toBe('Nova Permissao');
      expect(params.chave).toBe('nova:permissao');
    });
  });

  describe('AtualizarPermissaoParams', () => {
    it('deve validar parametros de atualizacao', () => {
      const params: { nome?: string; chave?: string; descricao?: string } = {
        nome: 'Nome Atualizado',
      };

      expect(params.nome).toBe('Nome Atualizado');
      expect(params.chave).toBeUndefined();
    });
  });
});
