import { ConflictException, NotFoundException } from '@nestjs/common';
import { IPermissoesRepository } from '../src/domain/interfaces/permissoes-repository.interface';
import { CriarPermissaoUseCase } from '../src/application/permissoes/usecases/criar-permissao.usecase';
import { ListarPermissoesUseCase } from '../src/application/permissoes/usecases/listar-permissoes.usecase';
import { ListarPermissaoPorIdUseCase } from '../src/application/permissoes/usecases/listar-permissao-por-id.usecase';
import { AtualizarPermissaoUseCase } from '../src/application/permissoes/usecases/atualizar-permissao.usecase';
import { DeletarPermissaoUseCase } from '../src/application/permissoes/usecases/deletar-permissao.usecase';
import { CriarPermissaoDto } from '../src/application/permissoes/dto/permissao.dto';

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

describe('PermissoesUseCases', () => {
  let criarUseCase: CriarPermissaoUseCase;
  let listarUseCase: ListarPermissoesUseCase;
  let listarPorIdUseCase: ListarPermissaoPorIdUseCase;
  let atualizarUseCase: AtualizarPermissaoUseCase;
  let deletarUseCase: DeletarPermissaoUseCase;
  let mockRepository: jest.Mocked<IPermissoesRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByNomeOrChave: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    criarUseCase = new CriarPermissaoUseCase(mockRepository);
    listarUseCase = new ListarPermissoesUseCase(mockRepository);
    listarPorIdUseCase = new ListarPermissaoPorIdUseCase(mockRepository);
    atualizarUseCase = new AtualizarPermissaoUseCase(mockRepository);
    deletarUseCase = new DeletarPermissaoUseCase(mockRepository);
  });

  describe('CriarPermissaoUseCase', () => {
    it('deve criar uma permissao com dados validos', async () => {
      const dto: CriarPermissaoDto = {
        nome: 'Criar Usuario',
        chave: 'usuario:criar',
        descricao: 'Permite criar usuarios',
      };

      mockRepository.findByNomeOrChave.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ ...mockPermissao, ...dto });

      const resultado = await criarUseCase.execute(dto);

      expect(resultado.nome).toBe(dto.nome);
      expect(resultado.chave).toBe(dto.chave);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lancar ConflictException quando nome ja existe', async () => {
      const dto: CriarPermissaoDto = {
        nome: 'Criar Usuario',
        chave: 'usuario:criar',
        descricao: 'Permite criar usuarios',
      };

      mockRepository.findByNomeOrChave.mockResolvedValue(mockPermissao);

      await expect(criarUseCase.execute(dto)).rejects.toThrow(ConflictException);
    });

    it('deve lancar ConflictException quando chave ja existe', async () => {
      const dto: CriarPermissaoDto = {
        nome: 'Outro Nome',
        chave: 'usuario:criar',
        descricao: 'Permite criar usuarios',
      };

      mockRepository.findByNomeOrChave.mockResolvedValue({ ...mockPermissao, nome: 'Nome Diferente' });

      await expect(criarUseCase.execute(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('ListarPermissoesUseCase', () => {
    it('deve retornar permissoes ativas', async () => {
      mockRepository.findAll.mockResolvedValue([mockPermissao, mockPermissao]);

      const resultado = await listarUseCase.execute();

      expect(resultado).toHaveLength(2);
    });

    it('deve retornar array vazio quando nao houver permissoes', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const resultado = await listarUseCase.execute();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('ListarPermissaoPorIdUseCase', () => {
    it('deve retornar permissao quando encontrada', async () => {
      mockRepository.findById.mockResolvedValue(mockPermissao);

      const resultado = await listarPorIdUseCase.execute('uuid-permissao-test');

      expect(resultado.id).toBe(mockPermissao.id);
    });

    it('deve lancar NotFoundException quando nao encontrar', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(listarPorIdUseCase.execute('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('AtualizarPermissaoUseCase', () => {
    it('deve atualizar campos da permissao', async () => {
      const dto = { nome: 'Nome Atualizado' };
      mockRepository.findById.mockResolvedValue(mockPermissao);
      mockRepository.findByNomeOrChave.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({ ...mockPermissao, nome: 'Nome Atualizado' });

      const resultado = await atualizarUseCase.execute('uuid-permissao-test', dto);

      expect(resultado.nome).toBe('Nome Atualizado');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve lancar NotFoundException quando permissao nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(atualizarUseCase.execute('uuid-invalido', { nome: 'teste' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('DeletarPermissaoUseCase', () => {
    it('deve fazer soft-delete da permissao', async () => {
      mockRepository.findById.mockResolvedValue(mockPermissao);

      await deletarUseCase.execute('uuid-permissao-test');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('uuid-permissao-test');
    });

    it('deve lancar NotFoundException quando permissao nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deletarUseCase.execute('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });
});