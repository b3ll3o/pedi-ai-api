import { RestaurantesRepositoryImpl } from '../../src/restaurante/infrastructure/persistence/restaurantes-repository.impl';
import {
  CreateRestauranteInput,
  UpdateRestauranteInput,
} from '../../src/restaurante/domain/repositories/restaurantes-repository.interface';

describe('RestaurantesRepositoryImpl', () => {
  let mockPrisma: any;
  let repository: RestaurantesRepositoryImpl;

  const mockRestaurante = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Restaurante Teste',
    cnpj: '45381763000168',
    email: 'teste@restaurante.com',
    telefone: '11999999999',
    endereco: 'Rua teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    horarioAbertura: '09:00',
    horarioFechamento: '22:00',
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  beforeEach(() => {
    mockPrisma = {
      restaurante: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new RestaurantesRepositoryImpl(mockPrisma);
  });

  describe('create', () => {
    it('deve criar restaurante', async () => {
      const input: CreateRestauranteInput = {
        nome: 'Restaurante Teste',
        cnpj: '45381763000168',
        email: 'teste@restaurante.com',
        telefone: '11999999999',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      mockPrisma.restaurante.create.mockResolvedValue(mockRestaurante);

      const result = await repository.create(input);

      expect(result).toEqual(mockRestaurante);
      expect(mockPrisma.restaurante.create).toHaveBeenCalledWith({ data: input });
    });
  });

  describe('findAll', () => {
    it('deve retornar array de restaurantes', async () => {
      mockPrisma.restaurante.findMany.mockResolvedValue([mockRestaurante]);

      const result = await repository.findAll();

      expect(result).toEqual([mockRestaurante]);
      expect(mockPrisma.restaurante.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, ativo: true },
        orderBy: { nome: 'asc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('deve retornar array vazio quando não há restaurantes', async () => {
      mockPrisma.restaurante.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve retornar restaurante quando existe', async () => {
      mockPrisma.restaurante.findFirst.mockResolvedValue(mockRestaurante);

      const result = await repository.findById(mockRestaurante.id);

      expect(result).toEqual(mockRestaurante);
      expect(mockPrisma.restaurante.findFirst).toHaveBeenCalledWith({
        where: { id: mockRestaurante.id, deletedAt: null },
      });
    });

    it('deve retornar null quando não existe', async () => {
      mockPrisma.restaurante.findFirst.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByCnpj', () => {
    it('deve retornar restaurante quando CNPJ existe', async () => {
      mockPrisma.restaurante.findFirst.mockResolvedValue(mockRestaurante);

      const result = await repository.findByCnpj(mockRestaurante.cnpj);

      expect(result).toEqual(mockRestaurante);
      expect(mockPrisma.restaurante.findFirst).toHaveBeenCalledWith({
        where: { cnpj: mockRestaurante.cnpj, deletedAt: null },
      });
    });

    it('deve retornar null quando CNPJ não existe', async () => {
      mockPrisma.restaurante.findFirst.mockResolvedValue(null);

      const result = await repository.findByCnpj('00000000000000');

      const result2 = await repository.findByCnpj('00000000000000');
      expect(result2).toBeNull();
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar restaurante (single query, sem pre-check)', async () => {
      const updateData: UpdateRestauranteInput = { nome: 'Novo Nome' };
      const updatedRestaurante = { ...mockRestaurante, nome: 'Novo Nome' };

      mockPrisma.restaurante.update.mockResolvedValue(updatedRestaurante);

      const result = await repository.update(mockRestaurante.id, updateData);

      expect(result.nome).toBe('Novo Nome');
      expect(mockPrisma.restaurante.update).toHaveBeenCalledWith({
        where: { id: mockRestaurante.id },
        data: updateData,
      });
      // Sem pre-check: o use-case já fez findById. P2025 vira 404 via
      // handlePrismaError no caller.
      expect(mockPrisma.restaurante.findFirst).not.toHaveBeenCalled();
    });

    it('deve propagar P2025 do update (NotFoundException vem do handlePrismaError no caller)', async () => {
      const { Prisma } = await import('@prisma/client');
      const p2025 = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      mockPrisma.restaurante.update.mockRejectedValue(p2025);

      await expect(repository.update('uuid-invalido', { nome: 'X' })).rejects.toBe(p2025);
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft delete do restaurante', async () => {
      mockPrisma.restaurante.update.mockResolvedValue({
        ...mockRestaurante,
        deletedAt: new Date(),
      });

      await repository.softDelete(mockRestaurante.id);

      // `ativo` deliberadamente NÃO é tocado: findAll já filtra por
      // `ativo: true` e a saída da listagem é garantida pelo `deletedAt: null`.
      expect(mockPrisma.restaurante.update).toHaveBeenCalledWith({
        where: { id: mockRestaurante.id },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
