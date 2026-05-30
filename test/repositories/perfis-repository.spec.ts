import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { PerfisRepositoryImpl } from '../../src/infrastructure/database/prisma/repositories/perfis-repository.impl';

const mockPrisma = {
  perfil: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  permissao: {
    findMany: jest.fn(),
  },
};

describe('PerfisRepositoryImpl', () => {
  let repository: PerfisRepositoryImpl;

  const mockPerfil = {
    id: 'uuid-perfil-test',
    nome: 'Perfil Teste',
    descricao: 'Perfil de teste',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
    permissoes: [],
  };

  const mockPermissao = {
    id: 'uuid-permissao-1',
    nome: 'Permissao 1',
    chave: 'permissao_1',
    descricao: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
    perfis: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: mockPrisma }, PerfisRepositoryImpl],
    }).compile();

    repository = module.get<PerfisRepositoryImpl>(PerfisRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve retornar perfil quando encontrado', async () => {
      mockPrisma.perfil.findUnique.mockResolvedValue(mockPerfil);

      const resultado = await repository.findById('uuid-perfil-test');

      expect(resultado).toEqual(mockPerfil);
      expect(mockPrisma.perfil.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-perfil-test', deletedAt: null },
        include: { permissoes: true },
      });
    });

    it('deve retornar null quando perfil nao encontrado', async () => {
      mockPrisma.perfil.findUnique.mockResolvedValue(null);

      const resultado = await repository.findById('uuid-invalido');

      expect(resultado).toBeNull();
    });
  });

  describe('findByNome', () => {
    it('deve retornar perfil quando encontrado', async () => {
      mockPrisma.perfil.findUnique.mockResolvedValue(mockPerfil);

      const resultado = await repository.findByNome('Perfil Teste');

      expect(resultado).toEqual(mockPerfil);
      expect(mockPrisma.perfil.findUnique).toHaveBeenCalledWith({
        where: { nome: 'Perfil Teste', deletedAt: null },
      });
    });

    it('deve retornar null quando nome nao encontrado', async () => {
      mockPrisma.perfil.findUnique.mockResolvedValue(null);

      const resultado = await repository.findByNome('Nome Inexistente');

      expect(resultado).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de perfis', async () => {
      const perfis = [mockPerfil, mockPerfil];
      mockPrisma.perfil.findMany.mockResolvedValue(perfis);

      const resultado = await repository.findAll();

      expect(resultado).toHaveLength(2);
      expect(mockPrisma.perfil.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: { permissoes: true },
      });
    });

    it('deve retornar array vazio quando nao houver perfis', async () => {
      mockPrisma.perfil.findMany.mockResolvedValue([]);

      const resultado = await repository.findAll();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('deve criar perfil com dados fornecidos', async () => {
      const criarData = {
        nome: 'Novo Perfil',
        descricao: 'Nova descricao',
      };
      const perfilCriado = { ...mockPerfil, ...criarData };
      mockPrisma.perfil.create.mockResolvedValue(perfilCriado);

      const resultado = await repository.create(criarData);

      expect(resultado).toEqual(perfilCriado);
      expect(mockPrisma.perfil.create).toHaveBeenCalledWith({ data: criarData });
    });
  });

  describe('update', () => {
    it('deve atualizar perfil com dados fornecidos', async () => {
      const updateData = { nome: 'Nome Atualizado' };
      const perfilAtualizado = { ...mockPerfil, ...updateData };
      mockPrisma.perfil.update.mockResolvedValue(perfilAtualizado);

      const resultado = await repository.update('uuid-perfil-test', updateData);

      expect(resultado).toEqual(perfilAtualizado);
      expect(mockPrisma.perfil.update).toHaveBeenCalledWith({
        where: { id: 'uuid-perfil-test' },
        data: updateData,
        include: { permissoes: true },
      });
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft-delete atualizando deletedAt', async () => {
      mockPrisma.perfil.update.mockResolvedValue({});

      await repository.softDelete('uuid-perfil-test');

      expect(mockPrisma.perfil.update).toHaveBeenCalledWith({
        where: { id: 'uuid-perfil-test' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('associarPermissoes', () => {
    it('deve associar permissoes ao perfil', async () => {
      const permissoesIds = ['uuid-permissao-1', 'uuid-permissao-2'];
      const perfilComPermissoes = { ...mockPerfil, permissoes: [mockPermissao] };
      mockPrisma.perfil.update.mockResolvedValue(perfilComPermissoes);

      const resultado = await repository.associarPermissoes('uuid-perfil-test', permissoesIds);

      expect(resultado).toEqual(perfilComPermissoes);
      expect(mockPrisma.perfil.update).toHaveBeenCalledWith({
        where: { id: 'uuid-perfil-test' },
        data: {
          permissoes: {
            connect: permissoesIds.map((id) => ({ id })),
          },
        },
        include: { permissoes: true },
      });
    });
  });

  describe('desassociarPermissao', () => {
    it('deve desassociar permissao do perfil', async () => {
      mockPrisma.perfil.update.mockResolvedValue(mockPerfil);

      await repository.desassociarPermissao('uuid-perfil-test', 'uuid-permissao');

      expect(mockPrisma.perfil.update).toHaveBeenCalledWith({
        where: { id: 'uuid-perfil-test' },
        data: {
          permissoes: {
            disconnect: { id: 'uuid-permissao' },
          },
        },
      });
    });
  });

  describe('findPermissoesByIds', () => {
    it('deve retornar permissoes pelos ids', async () => {
      const permissoes = [mockPermissao, mockPermissao];
      mockPrisma.permissao.findMany.mockResolvedValue(permissoes);

      const resultado = await repository.findPermissoesByIds([
        'uuid-permissao-1',
        'uuid-permissao-2',
      ]);

      expect(resultado).toHaveLength(2);
      expect(mockPrisma.permissao.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['uuid-permissao-1', 'uuid-permissao-2'] }, deletedAt: null },
      });
    });
  });
});
