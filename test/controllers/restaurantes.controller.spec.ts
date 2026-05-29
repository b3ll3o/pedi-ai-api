import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantesController } from '../../src/restaurante/presentation/restaurantes/restaurantes.controller';
import { CriarRestauranteUseCase } from '../../src/restaurante/application/use-cases/criar-restaurante.usecase';
import { ListarRestaurantesUseCase } from '../../src/restaurante/application/use-cases/listar-restaurantes.usecase';
import { ListarRestaurantePorIdUseCase } from '../../src/restaurante/application/use-cases/listar-restaurante-por-id.usecase';
import { AtualizarRestauranteUseCase } from '../../src/restaurante/application/use-cases/atualizar-restaurante.usecase';
import { DeletarRestauranteUseCase } from '../../src/restaurante/application/use-cases/deletar-restaurante.usecase';
import { IRESTAURANTES_REPOSITORY } from '../../src/restaurante/domain/repositories/restaurantes-repository.interface';
import { IPERFIS_REPOSITORY } from '../../src/domain/interfaces/perfis-repository.interface';

describe('RestaurantesController', () => {
  let controller: RestaurantesController;
  let mockCriarUseCase: any;
  let mockListarUseCase: any;
  let mockListarPorIdUseCase: any;
  let mockAtualizarUseCase: any;
  let mockDeletarUseCase: any;

  const mockRestauranteResponse = {
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
    createdAt: '2026-05-28T10:00:00.000Z',
    updatedAt: '2026-05-28T10:00:00.000Z',
  };

  beforeEach(async () => {
    mockCriarUseCase = { execute: jest.fn() };
    mockListarUseCase = { execute: jest.fn() };
    mockListarPorIdUseCase = { execute: jest.fn() };
    mockAtualizarUseCase = { execute: jest.fn() };
    mockDeletarUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantesController],
      providers: [
        { provide: CriarRestauranteUseCase, useValue: mockCriarUseCase },
        { provide: ListarRestaurantesUseCase, useValue: mockListarUseCase },
        { provide: ListarRestaurantePorIdUseCase, useValue: mockListarPorIdUseCase },
        { provide: AtualizarRestauranteUseCase, useValue: mockAtualizarUseCase },
        { provide: DeletarRestauranteUseCase, useValue: mockDeletarUseCase },
        {
          provide: IRESTAURANTES_REPOSITORY,
          useValue: {
            findByCnpj: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: IPERFIS_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RestaurantesController>(RestaurantesController);
  });

  it('deve criar restaurante (201)', async () => {
    mockCriarUseCase.execute.mockResolvedValue(mockRestauranteResponse);

    const dto = {
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

    const result = await controller.criar(dto);

    expect(result).toEqual(mockRestauranteResponse);
    expect(mockCriarUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('deve listar todos restaurantes (200)', async () => {
    mockListarUseCase.execute.mockResolvedValue([mockRestauranteResponse]);

    const result = await controller.listarTodos();

    expect(result).toEqual([mockRestauranteResponse]);
    expect(mockListarUseCase.execute).toHaveBeenCalled();
  });

  it('deve listar restaurante por ID (200)', async () => {
    mockListarPorIdUseCase.execute.mockResolvedValue(mockRestauranteResponse);

    const result = await controller.listarUm('123e4567-e89b-12d3-a456-426614174000');

    expect(result).toEqual(mockRestauranteResponse);
    expect(mockListarPorIdUseCase.execute).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
  });

  it('deve listar restaurante por ID inexistente (404)', async () => {
    mockListarPorIdUseCase.execute.mockRejectedValue(new Error('Restaurante não encontrado'));

    await expect(
      controller.listarUm('non-existent-id'),
    ).rejects.toThrow('Restaurante não encontrado');
  });

  it('deve atualizar restaurante (200)', async () => {
    const updatedResponse = { ...mockRestauranteResponse, nome: 'Novo Nome' };
    mockAtualizarUseCase.execute.mockResolvedValue(updatedResponse);

    const result = await controller.atualizar('123e4567-e89b-12d3-a456-426614174000', { nome: 'Novo Nome' });

    expect(result.nome).toBe('Novo Nome');
  });

  it('deve deletar restaurante (204)', async () => {
    mockDeletarUseCase.execute.mockResolvedValue();

    await expect(
      controller.deletar('123e4567-e89b-12d3-a456-426614174000'),
    ).resolves.toBeUndefined();
  });
});