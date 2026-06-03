import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { PermissoesRepositoryImpl } from '../../src/infrastructure/database/prisma/repositories/permissoes-repository.impl';

const mockPrisma = {
  permissao: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('PermissoesRepositoryImpl', () => {
  let repository: PermissoesRepositoryImpl;

  const mockPermissao = {
    id: 'uuid-permissao-test',
    nome: 'Criar Usuario',
    chave: 'usuario:criar',
    descricao: 'Permite criar usuarios',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
    perfis: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: mockPrisma }, PermissoesRepositoryImpl],
    }).compile();

    repository = module.get<PermissoesRepositoryImpl>(PermissoesRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve retornar permissao quando encontrada', async () => {
      mockPrisma.permissao.findUnique.mockResolvedValue(mockPermissao);

      const resultado = await repository.findById('uuid-permissao-test');

      expect(resultado).toEqual(mockPermissao);
      expect(mockPrisma.permissao.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-permissao-test', deletedAt: null },
        include: { perfis: true },
      });
    });

    it('deve retornar null quando permissao nao encontrada', async () => {
      mockPrisma.permissao.findUnique.mockResolvedValue(null);

      const resultado = await repository.findById('uuid-invalido');

      expect(resultado).toBeNull();
    });
  });

  describe('findByNomeOrChave', () => {
    it('deve retornar permissao quando nome existe', async () => {
      mockPrisma.permissao.findFirst.mockResolvedValue(mockPermissao);

      const resultado = await repository.findByNomeOrChave('Criar Usuario', '');

      expect(resultado).toEqual(mockPermissao);
      expect(mockPrisma.permissao.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ nome: 'Criar Usuario' }, { chave: '' }],
          deletedAt: null,
        },
      });
    });

    it('deve retornar permissao quando chave existe', async () => {
      mockPrisma.permissao.findFirst.mockResolvedValue(mockPermissao);

      const resultado = await repository.findByNomeOrChave('', 'usuario:criar');

      expect(resultado).toEqual(mockPermissao);
    });

    it('deve retornar null quando nada encontrado', async () => {
      mockPrisma.permissao.findFirst.mockResolvedValue(null);

      const resultado = await repository.findByNomeOrChave('Inexistente', 'inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de permissoes', async () => {
      const permissoes = [mockPermissao, mockPermissao];
      mockPrisma.permissao.findMany.mockResolvedValue(permissoes);

      const resultado = await repository.findAll();

      expect(resultado).toHaveLength(2);
      expect(mockPrisma.permissao.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { perfis: true },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('deve retornar array vazio quando nao houver permissoes', async () => {
      mockPrisma.permissao.findMany.mockResolvedValue([]);

      const resultado = await repository.findAll();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('deve criar permissao com dados fornecidos', async () => {
      const criarData = {
        nome: 'Nova Permissao',
        chave: 'nova:permissao',
        descricao: 'Descricao da nova permissao',
      };
      const permissaoCriada = { ...mockPermissao, ...criarData };
      mockPrisma.permissao.create.mockResolvedValue(permissaoCriada);

      const resultado = await repository.create(criarData);

      expect(resultado).toEqual(permissaoCriada);
      expect(mockPrisma.permissao.create).toHaveBeenCalledWith({ data: criarData });
    });
  });

  describe('update', () => {
    it('deve atualizar permissao com dados fornecidos', async () => {
      const updateData = { nome: 'Nome Atualizado' };
      const permissaoAtualizada = { ...mockPermissao, ...updateData };
      mockPrisma.permissao.update.mockResolvedValue(permissaoAtualizada);

      const resultado = await repository.update('uuid-permissao-test', updateData);

      expect(resultado).toEqual(permissaoAtualizada);
      expect(mockPrisma.permissao.update).toHaveBeenCalledWith({
        where: { id: 'uuid-permissao-test', deletedAt: null },
        data: updateData,
        include: { perfis: true },
      });
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft-delete atualizando deletedAt', async () => {
      mockPrisma.permissao.update.mockResolvedValue({});

      await repository.softDelete('uuid-permissao-test');

      expect(mockPrisma.permissao.update).toHaveBeenCalledWith({
        where: { id: 'uuid-permissao-test' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
