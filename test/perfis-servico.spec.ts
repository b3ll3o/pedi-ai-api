import { ConflictException, NotFoundException } from '@nestjs/common';
import { IPerfisRepository } from '../src/domain/interfaces/perfis-repository.interface';
import { IPermissoesRepository } from '../src/domain/interfaces/permissoes-repository.interface';
import { CriarPerfilUseCase } from '../src/application/perfis/usecases/criar-perfil.usecase';
import { ListarPerfisUseCase } from '../src/application/perfis/usecases/listar-perfis.usecase';
import { ListarPerfilPorIdUseCase } from '../src/application/perfis/usecases/listar-perfil-por-id.usecase';
import { AtualizarPerfilUseCase } from '../src/application/perfis/usecases/atualizar-perfil.usecase';
import { DeletarPerfilUseCase } from '../src/application/perfis/usecases/deletar-perfil.usecase';
import { AssociarPermissoesPerfilUseCase } from '../src/application/perfis/usecases/associar-permissoes-perfil.usecase';
import { DesassociarPermissaoPerfilUseCase } from '../src/application/perfis/usecases/desassociar-permissao-perfil.usecase';
import { CriarPerfilDto } from '../src/application/perfis/dto/perfil.dto';

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

const mockPermissao = {
  id: 'uuid-permissao-1',
  nome: 'Permissao 1',
  chave: 'permissao_1',
  descricao: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  version: 1,
  perfis: [],
};

describe('PerfisUseCases', () => {
  let criarUseCase: CriarPerfilUseCase;
  let listarUseCase: ListarPerfisUseCase;
  let listarPorIdUseCase: ListarPerfilPorIdUseCase;
  let atualizarUseCase: AtualizarPerfilUseCase;
  let deletarUseCase: DeletarPerfilUseCase;
  let associarUseCase: AssociarPermissoesPerfilUseCase;
  let desassociarUseCase: DesassociarPermissaoPerfilUseCase;
  let mockRepository: jest.Mocked<IPerfisRepository>;
  let mockPermissoesRepository: jest.Mocked<IPermissoesRepository>;

  beforeEach(() => {
    mockRepository = {
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

    mockPermissoesRepository = {
      findById: jest.fn(),
      findByNomeOrChave: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    criarUseCase = new CriarPerfilUseCase(mockRepository);
    listarUseCase = new ListarPerfisUseCase(mockRepository);
    listarPorIdUseCase = new ListarPerfilPorIdUseCase(mockRepository);
    atualizarUseCase = new AtualizarPerfilUseCase(mockRepository);
    deletarUseCase = new DeletarPerfilUseCase(mockRepository);
    associarUseCase = new AssociarPermissoesPerfilUseCase(mockRepository);
    desassociarUseCase = new DesassociarPermissaoPerfilUseCase(mockRepository);
  });

  describe('CriarPerfilUseCase', () => {
    it('deve criar um perfil com dados validos', async () => {
      const dto: CriarPerfilDto = {
        nome: 'Perfil Teste',
        descricao: 'Perfil de teste',
      };

      mockRepository.findByNome.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ ...mockPerfil, ...dto });

      const resultado = await criarUseCase.execute(dto);

      expect(resultado.nome).toBe(dto.nome);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('deve lancar ConflictException quando nome ja existe', async () => {
      const dto: CriarPerfilDto = {
        nome: 'Perfil Teste',
        descricao: 'Perfil de teste',
      };

      mockRepository.findByNome.mockResolvedValue(mockPerfil);

      await expect(criarUseCase.execute(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('ListarPerfisUseCase', () => {
    it('deve retornar perfis ativos', async () => {
      mockRepository.findAll.mockResolvedValue([mockPerfil, mockPerfil]);

      const resultado = await listarUseCase.execute();

      expect(resultado).toHaveLength(2);
    });

    it('deve retornar array vazio quando nao houver perfis', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const resultado = await listarUseCase.execute();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('ListarPerfilPorIdUseCase', () => {
    it('deve retornar perfil quando encontrado', async () => {
      mockRepository.findById.mockResolvedValue(mockPerfil);

      const resultado = await listarPorIdUseCase.execute('uuid-perfil-test');

      expect(resultado.id).toBe(mockPerfil.id);
    });

    it('deve lancar NotFoundException quando nao encontrar', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(listarPorIdUseCase.execute('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('AtualizarPerfilUseCase', () => {
    it('deve atualizar campos do perfil', async () => {
      const dto = { nome: 'Nome Atualizado' };
      mockRepository.findById.mockResolvedValue(mockPerfil);
      mockRepository.findByNome.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({ ...mockPerfil, nome: 'Nome Atualizado' });

      const resultado = await atualizarUseCase.execute('uuid-perfil-test', dto);

      expect(resultado.nome).toBe('Nome Atualizado');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve lancar ConflictException quando nome duplicado', async () => {
      const dto = { nome: 'Nome Duplicado' };
      mockRepository.findById.mockResolvedValue(mockPerfil);
      mockRepository.findByNome.mockResolvedValue({
        ...mockPerfil,
        id: 'outro-id',
        nome: 'Nome Duplicado',
      });

      await expect(atualizarUseCase.execute('uuid-perfil-test', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lancar NotFoundException quando perfil nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(atualizarUseCase.execute('uuid-invalido', { nome: 'teste' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DeletarPerfilUseCase', () => {
    it('deve fazer soft-delete do perfil', async () => {
      mockRepository.findById.mockResolvedValue(mockPerfil);

      await deletarUseCase.execute('uuid-perfil-test');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('uuid-perfil-test');
    });

    it('deve lancar NotFoundException quando perfil nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deletarUseCase.execute('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('AssociarPermissoesPerfilUseCase', () => {
    it('deve associar permissoes ao perfil', async () => {
      const permissoesIds = ['uuid-permissao-1', 'uuid-permissao-2'];
      const permissoes = [
        { ...mockPermissao, id: 'uuid-permissao-1' },
        { ...mockPermissao, id: 'uuid-permissao-2' },
      ];

      mockRepository.findById.mockResolvedValue(mockPerfil);
      mockRepository.findPermissoesByIds.mockResolvedValue(permissoes as any);
      mockRepository.associarPermissoes.mockResolvedValue({
        ...mockPerfil,
        permissoes: permissoes,
      } as any);

      const resultado = await associarUseCase.execute('uuid-perfil-test', permissoesIds);

      expect(mockRepository.associarPermissoes).toHaveBeenCalledWith(
        'uuid-perfil-test',
        permissoesIds,
      );
    });

    it('deve lancar NotFoundException quando perfil nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(associarUseCase.execute('uuid-invalido', [])).rejects.toThrow(NotFoundException);
    });

    it('deve lancar NotFoundException quando permissao nao existe', async () => {
      mockRepository.findById.mockResolvedValue(mockPerfil);
      mockRepository.findPermissoesByIds.mockResolvedValue([]);

      await expect(
        associarUseCase.execute('uuid-perfil-test', ['uuid-inexistente']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DesassociarPermissaoPerfilUseCase', () => {
    it('deve desassociar permissao do perfil', async () => {
      mockRepository.findById.mockResolvedValue(mockPerfil);
      mockRepository.desassociarPermissao.mockResolvedValue();

      await desassociarUseCase.execute('uuid-perfil-test', 'uuid-permissao');

      expect(mockRepository.desassociarPermissao).toHaveBeenCalledWith(
        'uuid-perfil-test',
        'uuid-permissao',
      );
    });

    it('deve lancar NotFoundException quando perfil nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(desassociarUseCase.execute('uuid-invalido', 'uuid-permissao')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
