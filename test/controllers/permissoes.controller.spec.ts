import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PermissoesController } from '../../src/presentation/permissoes/controllers/permissoes.controller';
import { CriarPermissaoUseCase } from '../../src/application/permissoes/usecases/criar-permissao.usecase';
import { ListarPermissoesUseCase } from '../../src/application/permissoes/usecases/listar-permissoes.usecase';
import { ListarPermissaoPorIdUseCase } from '../../src/application/permissoes/usecases/listar-permissao-por-id.usecase';
import { AtualizarPermissaoUseCase } from '../../src/application/permissoes/usecases/atualizar-permissao.usecase';
import { DeletarPermissaoUseCase } from '../../src/application/permissoes/usecases/deletar-permissao.usecase';
import { CriarPermissaoDto } from '../../src/application/permissoes/dto/permissao.dto';

describe('PermissoesController', () => {
  let controller: PermissoesController;

  const mockPermissao = {
    id: 'uuid-permissao-test',
    nome: 'Criar Usuario',
    chave: 'usuario:criar',
    descricao: 'Permite criar usuarios',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
    perfis: [],
  };

  let mockCriarUseCase: jest.Mocked<CriarPermissaoUseCase>;
  let mockListarUseCase: jest.Mocked<ListarPermissoesUseCase>;
  let mockListarPorIdUseCase: jest.Mocked<ListarPermissaoPorIdUseCase>;
  let mockAtualizarUseCase: jest.Mocked<AtualizarPermissaoUseCase>;
  let mockDeletarUseCase: jest.Mocked<DeletarPermissaoUseCase>;

  beforeEach(async () => {
    mockCriarUseCase = { execute: jest.fn() } as any;
    mockListarUseCase = { execute: jest.fn() } as any;
    mockListarPorIdUseCase = { execute: jest.fn() } as any;
    mockAtualizarUseCase = { execute: jest.fn() } as any;
    mockDeletarUseCase = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissoesController],
      providers: [
        { provide: CriarPermissaoUseCase, useValue: mockCriarUseCase },
        { provide: ListarPermissoesUseCase, useValue: mockListarUseCase },
        { provide: ListarPermissaoPorIdUseCase, useValue: mockListarPorIdUseCase },
        { provide: AtualizarPermissaoUseCase, useValue: mockAtualizarUseCase },
        { provide: DeletarPermissaoUseCase, useValue: mockDeletarUseCase },
      ],
    }).compile();

    controller = module.get<PermissoesController>(PermissoesController);
  });

  describe('criar', () => {
    it('deve criar permissao e retornar resultado', async () => {
      const dto: CriarPermissaoDto = {
        nome: 'Criar Usuario',
        chave: 'usuario:criar',
        descricao: 'Permite criar usuarios',
      };
      mockCriarUseCase.execute.mockResolvedValue(mockPermissao);

      const resultado = await controller.criar(dto);

      expect(resultado).toEqual(mockPermissao);
      expect(mockCriarUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('listarTodos', () => {
    it('deve retornar lista de permissoes', async () => {
      const permissoes = [mockPermissao, mockPermissao];
      mockListarUseCase.execute.mockResolvedValue(permissoes);

      const resultado = await controller.listarTodos();

      expect(resultado).toHaveLength(2);
      expect(mockListarUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('listarUm', () => {
    it('deve retornar permissao quando encontrada', async () => {
      mockListarPorIdUseCase.execute.mockResolvedValue(mockPermissao);

      const resultado = await controller.listarUm('uuid-permissao-test');

      expect(resultado).toEqual(mockPermissao);
      expect(mockListarPorIdUseCase.execute).toHaveBeenCalledWith('uuid-permissao-test');
    });

    it('deve propagar erro quando permissao nao encontrada', async () => {
      mockListarPorIdUseCase.execute.mockRejectedValue(new NotFoundException('Permissao nao encontrada'));

      await expect(controller.listarUm('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar permissao e retornar resultado', async () => {
      const dto = { nome: 'Nome Atualizado' };
      const permissaoAtualizada = { ...mockPermissao, ...dto };
      mockAtualizarUseCase.execute.mockResolvedValue(permissaoAtualizada);

      const resultado = await controller.atualizar('uuid-permissao-test', dto);

      expect(resultado).toEqual(permissaoAtualizada);
      expect(mockAtualizarUseCase.execute).toHaveBeenCalledWith('uuid-permissao-test', dto);
    });
  });

  describe('deletar', () => {
    it('deve deletar permissao sem retornar conteudo', async () => {
      mockDeletarUseCase.execute.mockResolvedValue(undefined);

      const resultado = await controller.deletar('uuid-permissao-test');

      expect(resultado).toBeUndefined();
      expect(mockDeletarUseCase.execute).toHaveBeenCalledWith('uuid-permissao-test');
    });
  });
});