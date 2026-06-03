import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { UsuariosRepositoryImpl } from '../../src/infrastructure/database/prisma/repositories/usuarios-repository.impl';
import { IUsuariosRepository } from '../../src/domain/interfaces/usuarios-repository.interface';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsuariosRepositoryImpl', () => {
  let repository: UsuariosRepositoryImpl;

  const mockUsuario = {
    id: 'uuid-test',
    nome: 'Usuario Teste',
    email: 'teste@exemplo.com',
    senha: 'senha-hashed',
    perfil: { id: 'perfil-1', nome: 'ADMIN' },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: mockPrisma }, UsuariosRepositoryImpl],
    }).compile();

    repository = module.get<UsuariosRepositoryImpl>(UsuariosRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve retornar usuario quando encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUsuario);

      const resultado = await repository.findById('uuid-test');

      expect(resultado).toEqual(mockUsuario);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-test', deletedAt: null },
        include: { perfil: true },
      });
    });

    it('deve retornar null quando usuario nao encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const resultado = await repository.findById('uuid-invalido');

      expect(resultado).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuario quando encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUsuario);

      const resultado = await repository.findByEmail('teste@exemplo.com');

      expect(resultado).toEqual(mockUsuario);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com', deletedAt: null },
      });
    });

    it('deve retornar null quando email nao encontrado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const resultado = await repository.findByEmail('naoexiste@exemplo.com');

      expect(resultado).toBeNull();
    });
  });

  describe('findByEmailIncludingDeleted', () => {
    it('deve retornar usuario mesmo se soft-deletado', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUsuario);

      const resultado = await repository.findByEmailIncludingDeleted('teste@exemplo.com');

      expect(resultado).toEqual(mockUsuario);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'teste@exemplo.com' },
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuarios', async () => {
      const usuarios = [mockUsuario, mockUsuario];
      mockPrisma.user.findMany.mockResolvedValue(usuarios);

      const resultado = await repository.findAll();

      expect(resultado).toHaveLength(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('deve retornar array vazio quando nao houver usuarios', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const resultado = await repository.findAll();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('deve criar usuario com dados fornecidos', async () => {
      const criarData = {
        nome: 'Novo Usuario',
        email: 'novo@exemplo.com',
        senha: 'senha123',
      };
      const usuarioCriado = { ...mockUsuario, ...criarData };
      mockPrisma.user.create.mockResolvedValue(usuarioCriado);

      const resultado = await repository.create(criarData);

      expect(resultado).toEqual(usuarioCriado);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: criarData });
    });
  });

  describe('update', () => {
    it('deve atualizar usuario com dados fornecidos', async () => {
      const updateData = { nome: 'Nome Atualizado' };
      const usuarioAtualizado = { ...mockUsuario, ...updateData };
      mockPrisma.user.update.mockResolvedValue(usuarioAtualizado);

      const resultado = await repository.update('uuid-test', updateData);

      expect(resultado).toEqual(usuarioAtualizado);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-test', deletedAt: null },
        data: updateData,
      });
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft-delete atualizando deletedAt', async () => {
      mockPrisma.user.update.mockResolvedValue({});

      await repository.softDelete('uuid-test');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-test' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
