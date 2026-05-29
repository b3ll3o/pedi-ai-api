import { DeletarRestauranteUseCase } from '../../../../src/restaurante/application/use-cases/deletar-restaurante.usecase';
import { IRestaurantesRepository } from '../../../../src/restaurante/domain/repositories/restaurantes-repository.interface';

describe('DeletarRestauranteUseCase', () => {
  let mockRepository: jest.Mocked<IRestaurantesRepository>;
  let useCase: DeletarRestauranteUseCase;

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
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCnpj: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    useCase = new DeletarRestauranteUseCase(mockRepository);
  });

  it('deve fazer soft delete do restaurante', async () => {
    mockRepository.findById.mockResolvedValue(mockRestaurante);
    mockRepository.softDelete.mockResolvedValue();

    await useCase.execute(mockRestaurante.id);

    expect(mockRepository.softDelete).toHaveBeenCalledWith(mockRestaurante.id);
  });

  it('deve lançar NotFoundException quando não existe', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Restaurante não encontrado');
  });
});