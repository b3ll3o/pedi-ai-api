import { CriarRestauranteUseCase } from '../../../../src/restaurante/application/use-cases/criar-restaurante.usecase';
import {
  IRestaurantesRepository,
  CreateRestauranteInput,
} from '../../../../src/restaurante/domain/repositories/restaurantes-repository.interface';

describe('CriarRestauranteUseCase', () => {
  let mockRepository: jest.Mocked<IRestaurantesRepository>;
  let useCase: CriarRestauranteUseCase;

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

  const validDto = {
    nome: 'Restaurante Teste',
    cnpj: '45.381.763/0001-68',
    email: 'teste@restaurante.com',
    telefone: '11999999999',
    endereco: 'Rua teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    horarioAbertura: '09:00',
    horarioFechamento: '22:00',
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
    useCase = new CriarRestauranteUseCase(mockRepository);
  });

  it('deve criar restaurante quando dados são válidos', async () => {
    mockRepository.findByCnpj.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(mockRestaurante);

    const result = await useCase.execute(validDto);

    expect(result).toBeDefined();
    expect(result.id).toBe(mockRestaurante.id);
    expect(result.nome).toBe(mockRestaurante.nome);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('deve lançar erro quando CNPJ já existe', async () => {
    mockRepository.findByCnpj.mockResolvedValue(mockRestaurante);

    await expect(useCase.execute(validDto)).rejects.toThrow('CNPJ já cadastrado');
  });

  it('deve lançar erro quando horário abertura >= fechamento', async () => {
    mockRepository.findByCnpj.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(mockRestaurante);

    const dtoInvalido = { ...validDto, horarioFechamento: '08:00' }; // antes da abertura

    await expect(useCase.execute(dtoInvalido)).rejects.toThrow(
      'Horário de abertura deve ser anterior ao fechamento',
    );
  });

  it('não deve criar quando findByCnpj lança erro', async () => {
    mockRepository.findByCnpj.mockRejectedValue(new Error('Erro no banco'));

    await expect(useCase.execute(validDto)).rejects.toThrow('Erro no banco');
  });
});
