import { ListarRestaurantesUseCase } from '../../../../src/restaurante/application/use-cases/listar-restaurantes.usecase';
import { IRestaurantesRepository } from '../../../../src/restaurante/domain/repositories/restaurantes-repository.interface';

describe('ListarRestaurantesUseCase', () => {
  let mockRepository: jest.Mocked<IRestaurantesRepository>;
  let useCase: ListarRestaurantesUseCase;

  const mockRestaurantes = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nome: 'Restaurante A',
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
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      nome: 'Restaurante B',
      cnpj: '12345678000190',
      email: 'teste2@restaurante.com',
      telefone: '11988888888',
      endereco: 'Rua teste 2, 456',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '21234-567',
      horarioAbertura: '10:00',
      horarioFechamento: '23:00',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      version: 1,
    },
  ];

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCnpj: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    useCase = new ListarRestaurantesUseCase(mockRepository);
  });

  it('deve retornar array de restaurantes', async () => {
    mockRepository.findAll.mockResolvedValue(mockRestaurantes);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe('Restaurante A');
    expect(result[1].nome).toBe('Restaurante B');
  });

  it('deve retornar array vazio quando não há restaurantes', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });
});
