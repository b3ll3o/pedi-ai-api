import { RestaurantesRepositoryImpl } from '../../src/restaurante/infrastructure/persistence/restaurantes-repository.impl';
import { CreateRestauranteInput, UpdateRestauranteInput } from '../../src/restaurante/domain/repositories/restaurantes-repository.interface';

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
      mockPrisma.restaurante.findUnique.mockResolvedValue(mockRestaurante);

      const result = await repository.findById(mockRestaurante.id);

      expect(result).toEqual(mockRestaurante);
      expect(mockPrisma.restaurante.findUnique).toHaveBeenCalledWith({
        where: { id: mockRestaurante.id, deletedAt: null },
      });
    });

    it('deve retornar null quando não existe', async () => {
      mockPrisma.restaurante.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByCnpj', () => {
    it('deve retornar restaurante quando CNPJ existe', async () => {
      mockPrisma.restaurante.findUnique.mockResolvedValue(mockRestaurante);

      const result = await repository.findByCnpj(mockRestaurante.cnpj);

      expect(result).toEqual(mockRestaurante);
      expect(mockPrisma.restaurante.findUnique).toHaveBeenCalledWith({
        where: { cnpj: mockRestaurante.cnpj },
      });
    });

    it('deve retornar null quando CNPJ não existe', async () => {
      mockPrisma.restaurante.findUnique.mockResolvedValue(null);

      const result = await repository.findByCnpj('00000000000000');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar restaurante', async () => {
      const updateData: UpdateRestauranteInput = { nome: 'Novo Nome' };
      const updatedRestaurante = { ...mockRestaurante, nome: 'Novo Nome' };

      mockPrisma.restaurante.update.mockResolvedValue(updatedRestaurante);

      const result = await repository.update(mockRestaurante.id, updateData);

      expect(result.nome).toBe('Novo Nome');
      expect(mockPrisma.restaurante.update).toHaveBeenCalledWith({
        where: { id: mockRestaurante.id },
        data: updateData,
      });
    });
  });

  describe('softDelete', () => {
    it('deve fazer soft delete do restaurante', async () => {
      mockPrisma.restaurante.update.mockResolvedValue({ ...mockRestaurante, deletedAt: new Date() });

      await repository.softDelete(mockRestaurante.id);

      expect(mockPrisma.restaurante.update).toHaveBeenCalledWith({
        where: { id: mockRestaurante.id },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});