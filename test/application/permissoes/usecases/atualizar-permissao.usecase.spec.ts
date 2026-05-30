import { ConflictException, NotFoundException } from '@nestjs/common';
import { AtualizarPermissaoUseCase } from '../../../../src/application/permissoes/usecases/atualizar-permissao.usecase';
import { IPermissoesRepository } from '../../../../src/domain/interfaces/permissoes-repository.interface';

describe('AtualizarPermissaoUseCase', () => {
  let useCase: AtualizarPermissaoUseCase;
  let mockRepository: jest.Mocked<IPermissoesRepository>;

  const permissaoExistente = {
    id: 'permissao-123',
    nome: 'Criar Usuario',
    chave: 'usuario:criar',
    descricao: 'Permite criar usuarios',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNomeOrChave: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    useCase = new AtualizarPermissaoUseCase(mockRepository);
  });

  describe('execute', () => {
    it('deve atualizar nome da permissao com sucesso', async () => {
      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.findByNomeOrChave.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({
        ...permissaoExistente,
        nome: 'Nome Atualizado',
      });

      const result = await useCase.execute('permissao-123', { nome: 'Nome Atualizado' });

      expect(result.nome).toBe('Nome Atualizado');
      expect(mockRepository.update).toHaveBeenCalledWith('permissao-123', { nome: 'Nome Atualizado' });
    });

    it('deve atualizar chave da permissao com sucesso', async () => {
      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.findByNomeOrChave.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({
        ...permissaoExistente,
        chave: 'usuario:atualizar',
      });

      const result = await useCase.execute('permissao-123', { chave: 'usuario:atualizar' });

      expect(result.chave).toBe('usuario:atualizar');
    });

    it('deve atualizar descricao da permissao com sucesso', async () => {
      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.update.mockResolvedValue({
        ...permissaoExistente,
        descricao: 'Nova descricao',
      });

      const result = await useCase.execute('permissao-123', { descricao: 'Nova descricao' });

      expect(result.descricao).toBe('Nova descricao');
    });

    it('deve lanhar NotFoundException quando permissao nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('permissao-inexistente', { nome: 'Novo Nome' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('deve lanhar ConflictException quando nome ja existe em outra permissao', async () => {
      const permissaoComNomeDuplicado = {
        ...permissaoExistente,
        id: 'permissao-outra',
        nome: 'Nome Ja Utilizado',
        version: 1,
      };

      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.findByNomeOrChave.mockResolvedValue(permissaoComNomeDuplicado);

      await expect(useCase.execute('permissao-123', { nome: 'Nome Ja Utilizado' }))
        .rejects
        .toThrow(ConflictException);
    });

    it('deve lanhar ConflictException quando chave ja existe em outra permissao', async () => {
      const permissaoComChaveDuplicada = {
        ...permissaoExistente,
        id: 'permissao-outra',
        chave: 'chave:ja-existente',
        version: 1,
      };

      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.findByNomeOrChave.mockResolvedValue(permissaoComChaveDuplicada);

      await expect(useCase.execute('permissao-123', { chave: 'chave:ja-existente' }))
        .rejects
        .toThrow(ConflictException);
    });

    it('deve permitir atualizacao quando findByNomeOrChave retorna si mesmo', async () => {
      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.findByNomeOrChave.mockResolvedValue(permissaoExistente);
      mockRepository.update.mockResolvedValue({
        ...permissaoExistente,
        descricao: 'Nova descricao',
      });

      const result = await useCase.execute('permissao-123', { descricao: 'Nova descricao' });

      expect(result.descricao).toBe('Nova descricao');
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve atualizar multiplos campos simultaneamente', async () => {
      mockRepository.findById.mockResolvedValue(permissaoExistente);
      mockRepository.findByNomeOrChave.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({
        ...permissaoExistente,
        nome: 'Nome Novo',
        descricao: 'Descricao Nova',
      });

      const result = await useCase.execute('permissao-123', {
        nome: 'Nome Novo',
        descricao: 'Descricao Nova',
      });

      expect(result.nome).toBe('Nome Novo');
      expect(result.descricao).toBe('Descricao Nova');
    });
  });
});
