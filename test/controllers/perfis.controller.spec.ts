import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PerfisController } from '../../src/presentation/perfis/controllers/perfis.controller';
import { IPERFIS_REPOSITORY } from '../../src/domain/interfaces/perfis-repository.interface';
import { CriarPerfilUseCase } from '../../src/application/perfis/usecases/criar-perfil.usecase';
import { ListarPerfisUseCase } from '../../src/application/perfis/usecases/listar-perfis.usecase';
import { ListarPerfilPorIdUseCase } from '../../src/application/perfis/usecases/listar-perfil-por-id.usecase';
import { AtualizarPerfilUseCase } from '../../src/application/perfis/usecases/atualizar-perfil.usecase';
import { DeletarPerfilUseCase } from '../../src/application/perfis/usecases/deletar-perfil.usecase';
import { AssociarPermissoesPerfilUseCase } from '../../src/application/perfis/usecases/associar-permissoes-perfil.usecase';
import { DesassociarPermissaoPerfilUseCase } from '../../src/application/perfis/usecases/desassociar-permissao-perfil.usecase';
import { CriarPerfilDto } from '../../src/application/perfis/dto/perfil.dto';

describe('PerfisController', () => {
  let controller: PerfisController;

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

  let mockCriarUseCase: jest.Mocked<CriarPerfilUseCase>;
  let mockListarUseCase: jest.Mocked<ListarPerfisUseCase>;
  let mockListarPorIdUseCase: jest.Mocked<ListarPerfilPorIdUseCase>;
  let mockAtualizarUseCase: jest.Mocked<AtualizarPerfilUseCase>;
  let mockDeletarUseCase: jest.Mocked<DeletarPerfilUseCase>;
  let mockAssociarUseCase: jest.Mocked<AssociarPermissoesPerfilUseCase>;
  let mockDesassociarUseCase: jest.Mocked<DesassociarPermissaoPerfilUseCase>;
  let mockPerfisRepository: {
    findById: jest.Mock;
    findByNome: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    associarPermissoes: jest.Mock;
    desassociarPermissao: jest.Mock;
    findPermissoesByIds: jest.Mock;
  };

  beforeEach(async () => {
    mockPerfisRepository = {
      findById: jest.fn(),
      findByNome: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      associarPermissoes: jest.fn(),
      desassociarPermissao: jest.fn(),
      findPermissoesByIds: jest.fn(),
    };
    mockCriarUseCase = { execute: jest.fn() } as any;
    mockListarUseCase = { execute: jest.fn() } as any;
    mockListarPorIdUseCase = { execute: jest.fn() } as any;
    mockAtualizarUseCase = { execute: jest.fn() } as any;
    mockDeletarUseCase = { execute: jest.fn() } as any;
    mockAssociarUseCase = { execute: jest.fn() } as any;
    mockDesassociarUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfisController],
      providers: [
        { provide: IPERFIS_REPOSITORY, useValue: mockPerfisRepository },
        { provide: CriarPerfilUseCase, useValue: mockCriarUseCase },
        { provide: ListarPerfisUseCase, useValue: mockListarUseCase },
        { provide: ListarPerfilPorIdUseCase, useValue: mockListarPorIdUseCase },
        { provide: AtualizarPerfilUseCase, useValue: mockAtualizarUseCase },
        { provide: DeletarPerfilUseCase, useValue: mockDeletarUseCase },
        { provide: AssociarPermissoesPerfilUseCase, useValue: mockAssociarUseCase },
        { provide: DesassociarPermissaoPerfilUseCase, useValue: mockDesassociarUseCase },
      ],
    }).compile();

    controller = module.get<PerfisController>(PerfisController);
  });

  describe('criar', () => {
    it('deve criar perfil e retornar resultado', async () => {
      const dto: CriarPerfilDto = { nome: 'Perfil Teste', descricao: 'Descricao' };
      mockCriarUseCase.execute.mockResolvedValue(mockPerfil);

      const resultado = await controller.criar(dto);

      expect(resultado).toEqual(mockPerfil);
      expect(mockCriarUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('listarTodos', () => {
    it('deve retornar lista de perfis', async () => {
      const perfis = [mockPerfil, mockPerfil];
      mockListarUseCase.execute.mockResolvedValue(perfis);

      const resultado = await controller.listarTodos();

      expect(resultado).toHaveLength(2);
      expect(mockListarUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('listarUm', () => {
    it('deve retornar perfil quando encontrado', async () => {
      mockListarPorIdUseCase.execute.mockResolvedValue(mockPerfil);

      const resultado = await controller.listarUm('uuid-perfil-test');

      expect(resultado).toEqual(mockPerfil);
      expect(mockListarPorIdUseCase.execute).toHaveBeenCalledWith('uuid-perfil-test');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar perfil e retornar resultado', async () => {
      const dto = { nome: 'Nome Atualizado' };
      const perfilAtualizado = { ...mockPerfil, ...dto };
      mockAtualizarUseCase.execute.mockResolvedValue(perfilAtualizado);

      const resultado = await controller.atualizar('uuid-perfil-test', dto);

      expect(resultado).toEqual(perfilAtualizado);
      expect(mockAtualizarUseCase.execute).toHaveBeenCalledWith('uuid-perfil-test', dto);
    });
  });

  describe('deletar', () => {
    it('deve deletar perfil sem retornar conteudo', async () => {
      mockDeletarUseCase.execute.mockResolvedValue(undefined);

      const resultado = await controller.deletar('uuid-perfil-test');

      expect(resultado).toBeUndefined();
      expect(mockDeletarUseCase.execute).toHaveBeenCalledWith('uuid-perfil-test');
    });
  });

  describe('associarPermissoes', () => {
    it('deve associar permissoes ao perfil', async () => {
      const dto = { permissoesIds: ['uuid-1', 'uuid-2'] };
      const perfilComPermissoes = {
        ...mockPerfil,
        permissoes: [
          {
            id: 'uuid-1',
            nome: 'P1',
            chave: 'p1',
            descricao: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            version: 1,
            perfis: [],
          },
          {
            id: 'uuid-2',
            nome: 'P2',
            chave: 'p2',
            descricao: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            version: 1,
            perfis: [],
          },
        ],
      } as any;
      mockAssociarUseCase.execute.mockResolvedValue(perfilComPermissoes);

      const resultado = await controller.associarPermissoes('uuid-perfil-test', dto);

      expect(resultado).toEqual(perfilComPermissoes);
      expect(mockAssociarUseCase.execute).toHaveBeenCalledWith(
        'uuid-perfil-test',
        dto.permissoesIds,
      );
    });
  });

  describe('desassociarPermissao', () => {
    it('deve desassociar permissao do perfil', async () => {
      mockDesassociarUseCase.execute.mockResolvedValue(undefined);

      await controller.desassociarPermissao('uuid-perfil-test', 'uuid-permissao');

      expect(mockDesassociarUseCase.execute).toHaveBeenCalledWith(
        'uuid-perfil-test',
        'uuid-permissao',
      );
    });
  });
});
