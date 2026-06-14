import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsuariosController } from '../../src/presentation/usuarios/controllers/usuarios.controller';
import { IPERFIS_REPOSITORY } from '../../src/domain/interfaces/perfis-repository.interface';
import { CriarUsuarioUseCase } from '../../src/application/usuarios/usecases/criar-usuario.usecase';
import { ListarUsuariosUseCase } from '../../src/application/usuarios/usecases/listar-usuarios.usecase';
import { ListarUsuarioPorIdUseCase } from '../../src/application/usuarios/usecases/listar-usuario-por-id.usecase';
import { ListarUsuarioPorEmailUseCase } from '../../src/application/usuarios/usecases/listar-usuario-por-email.usecase';
import { AtualizarUsuarioUseCase } from '../../src/application/usuarios/usecases/atualizar-usuario.usecase';
import { DeletarUsuarioUseCase } from '../../src/application/usuarios/usecases/deletar-usuario.usecase';
import { ContarUsuariosUseCase } from '../../src/application/usuarios/usecases/contar-usuarios.usecase';
import { CriarUsuarioDto } from '../../src/application/usuarios/dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../../src/application/usuarios/dto/atualizar-usuario.dto';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  const mockUsuario = {
    id: 'uuid-test',
    nome: 'Usuario Teste',
    email: 'teste@exemplo.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  let mockCriarUseCase: jest.Mocked<CriarUsuarioUseCase>;
  let mockListarUseCase: jest.Mocked<ListarUsuariosUseCase>;
  let mockListarPorIdUseCase: jest.Mocked<ListarUsuarioPorIdUseCase>;
  let mockListarPorEmailUseCase: jest.Mocked<ListarUsuarioPorEmailUseCase>;
  let mockAtualizarUseCase: jest.Mocked<AtualizarUsuarioUseCase>;
  let mockDeletarUseCase: jest.Mocked<DeletarUsuarioUseCase>;
  let mockContarUseCase: jest.Mocked<ContarUsuariosUseCase>;
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
    mockCriarUseCase = {
      execute: jest.fn(),
    } as any;
    mockListarUseCase = {
      execute: jest.fn(),
    } as any;
    mockListarPorIdUseCase = {
      execute: jest.fn(),
    } as any;
    mockListarPorEmailUseCase = {
      execute: jest.fn(),
    } as any;
    mockAtualizarUseCase = {
      execute: jest.fn(),
    } as any;
    mockDeletarUseCase = {
      execute: jest.fn(),
    } as any;
    mockContarUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        { provide: IPERFIS_REPOSITORY, useValue: mockPerfisRepository },
        { provide: CriarUsuarioUseCase, useValue: mockCriarUseCase },
        { provide: ListarUsuariosUseCase, useValue: mockListarUseCase },
        { provide: ListarUsuarioPorIdUseCase, useValue: mockListarPorIdUseCase },
        { provide: ListarUsuarioPorEmailUseCase, useValue: mockListarPorEmailUseCase },
        { provide: AtualizarUsuarioUseCase, useValue: mockAtualizarUseCase },
        { provide: DeletarUsuarioUseCase, useValue: mockDeletarUseCase },
        { provide: ContarUsuariosUseCase, useValue: mockContarUseCase },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  describe('criar', () => {
    it('deve criar usuario e retornar resultado', async () => {
      const dto: CriarUsuarioDto = {
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: 'senha123',
      };
      mockCriarUseCase.execute.mockResolvedValue(mockUsuario);

      const resultado = await controller.criar(dto);

      expect(resultado).toEqual(mockUsuario);
      expect(mockCriarUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('listarTodos', () => {
    it('deve retornar lista de usuarios', async () => {
      const usuarios = [mockUsuario, mockUsuario];
      mockListarUseCase.execute.mockResolvedValue(usuarios);

      const resultado = await controller.listarTodos();

      expect(resultado).toHaveLength(2);
      expect(mockListarUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('listarUm', () => {
    it('deve retornar usuario quando encontrado', async () => {
      mockListarPorIdUseCase.execute.mockResolvedValue(mockUsuario);

      const resultado = await controller.listarUm('uuid-test');

      expect(resultado).toEqual(mockUsuario);
      expect(mockListarPorIdUseCase.execute).toHaveBeenCalledWith('uuid-test');
    });

    it('deve propagar erro quando usuario nao encontrado', async () => {
      mockListarPorIdUseCase.execute.mockRejectedValue(
        new NotFoundException('Usuario nao encontrado'),
      );

      await expect(controller.listarUm('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listarPorEmail', () => {
    it('deve retornar usuario por email', async () => {
      mockListarPorEmailUseCase.execute.mockResolvedValue(mockUsuario);

      const resultado = await controller.listarPorEmail('teste@exemplo.com');

      expect(resultado).toEqual(mockUsuario);
      expect(mockListarPorEmailUseCase.execute).toHaveBeenCalledWith('teste@exemplo.com');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar usuario e retornar resultado', async () => {
      const dto: AtualizarUsuarioDto = { nome: 'Nome Atualizado' };
      const usuarioAtualizado = { ...mockUsuario, nome: 'Nome Atualizado' };
      mockAtualizarUseCase.execute.mockResolvedValue(usuarioAtualizado);

      const resultado = await controller.atualizar('uuid-test', dto);

      expect(resultado).toEqual(usuarioAtualizado);
      expect(mockAtualizarUseCase.execute).toHaveBeenCalledWith('uuid-test', dto);
    });
  });

  describe('deletar', () => {
    it('deve deletar usuario sem retornar conteudo', async () => {
      mockDeletarUseCase.execute.mockResolvedValue(undefined);

      const resultado = await controller.deletar('uuid-test');

      expect(resultado).toBeUndefined();
      expect(mockDeletarUseCase.execute).toHaveBeenCalledWith('uuid-test');
    });
  });
});
