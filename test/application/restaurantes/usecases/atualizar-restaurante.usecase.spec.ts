import { AtualizarRestauranteUseCase } from '../../../../src/restaurante/application/use-cases/atualizar-restaurante.usecase';
import { IRestaurantesRepository } from '../../../../src/restaurante/domain/repositories/restaurantes-repository.interface';

describe('AtualizarRestauranteUseCase', () => {
  let mockRepository: jest.Mocked<IRestaurantesRepository>;
  let useCase: AtualizarRestauranteUseCase;

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
    useCase = new AtualizarRestauranteUseCase(mockRepository);
  });

  it('deve atualizar restaurante quando dados válidos', async () => {
    const updateData = { nome: 'Novo Nome' };
    const updatedRestaurante = { ...mockRestaurante, nome: 'Novo Nome' };

    mockRepository.findById.mockResolvedValue(mockRestaurante);
    mockRepository.update.mockResolvedValue(updatedRestaurante);

    const result = await useCase.execute(mockRestaurante.id, updateData);

    expect(result.nome).toBe('Novo Nome');
  });

  it('deve lançar NotFoundException quando não existe', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', { nome: 'Novo' })).rejects.toThrow(
      'Restaurante não encontrado',
    );
  });

  it('deve lançar erro quando horário inválido', async () => {
    mockRepository.findById.mockResolvedValue(mockRestaurante);

    const dtoInvalido = {
      horarioAbertura: '22:00',
      horarioFechamento: '09:00',
    };

    await expect(useCase.execute(mockRestaurante.id, dtoInvalido)).rejects.toThrow(
      'Horário de abertura deve ser anterior ao fechamento',
    );
  });
});
