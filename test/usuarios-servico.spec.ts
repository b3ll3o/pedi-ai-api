import { ConflictException, NotFoundException } from '@nestjs/common';
import { IUsuariosRepository } from '../src/domain/interfaces/usuarios-repository.interface';
import { ISenhaHashService } from '../src/domain/services/senha-hash.service';
import { CriarUsuarioUseCase } from '../src/application/usuarios/usecases/criar-usuario.usecase';
import { ListarUsuariosUseCase } from '../src/application/usuarios/usecases/listar-usuarios.usecase';
import { ListarUsuarioPorIdUseCase } from '../src/application/usuarios/usecases/listar-usuario-por-id.usecase';
import { ListarUsuarioPorEmailUseCase } from '../src/application/usuarios/usecases/listar-usuario-por-email.usecase';
import { AtualizarUsuarioUseCase } from '../src/application/usuarios/usecases/atualizar-usuario.usecase';
import { DeletarUsuarioUseCase } from '../src/application/usuarios/usecases/deletar-usuario.usecase';
import { CriarUsuarioDto } from '../src/application/usuarios/dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../src/application/usuarios/dto/atualizar-usuario.dto';

const mockUsuario = {
  id: 'uuid-test',
  nome: 'Usuario Teste',
  email: 'teste@exemplo.com',
  senha: 'senha-hashed',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  version: 1,
};

describe('UsuariosUseCases', () => {
  let criarUseCase: CriarUsuarioUseCase;
  let listarUseCase: ListarUsuariosUseCase;
  let listarPorIdUseCase: ListarUsuarioPorIdUseCase;
  let listarPorEmailUseCase: ListarUsuarioPorEmailUseCase;
  let atualizarUseCase: AtualizarUsuarioUseCase;
  let deletarUseCase: DeletarUsuarioUseCase;
  let mockRepository: jest.Mocked<IUsuariosRepository>;
  let mockSenhaHash: jest.Mocked<ISenhaHashService>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailIncludingDeleted: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockSenhaHash = {
      hash: jest.fn().mockResolvedValue('senha-hashed'),
      compare: jest.fn().mockResolvedValue(true),
    };

    criarUseCase = new CriarUsuarioUseCase(mockRepository, mockSenhaHash);
    listarUseCase = new ListarUsuariosUseCase(mockRepository);
    listarPorIdUseCase = new ListarUsuarioPorIdUseCase(mockRepository);
    listarPorEmailUseCase = new ListarUsuarioPorEmailUseCase(mockRepository);
    atualizarUseCase = new AtualizarUsuarioUseCase(mockRepository, mockSenhaHash);
    deletarUseCase = new DeletarUsuarioUseCase(mockRepository);
  });

  describe('CriarUsuarioUseCase', () => {
    it('deve criar um usuario com senha hashed', async () => {
      const dto: CriarUsuarioDto = {
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: 'senha123',
      };

      mockRepository.findByEmailIncludingDeleted.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({ ...mockUsuario, ...dto, senha: 'senha-hashed' });

      const resultado = await criarUseCase.execute(dto);

      expect(resultado.nome).toBe(dto.nome);
      expect(resultado.email).toBe(dto.email);
      expect((resultado as any).senha).toBeUndefined();
      expect(mockSenhaHash.hash).toHaveBeenCalledWith(dto.senha);
    });

    it('deve lancar ConflictException quando email ja existe', async () => {
      const dto: CriarUsuarioDto = {
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: 'senha123',
      };

      mockRepository.findByEmailIncludingDeleted.mockResolvedValue(mockUsuario);

      await expect(criarUseCase.execute(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('ListarUsuariosUseCase', () => {
    it('deve retornar usuarios sem o campo senha', async () => {
      mockRepository.findAll.mockResolvedValue([mockUsuario, mockUsuario]);

      const resultado = await listarUseCase.execute();

      expect(resultado).toHaveLength(2);
      expect((resultado[0] as any).senha).toBeUndefined();
    });

    it('deve retornar array vazio quando não houver usuarios', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const resultado = await listarUseCase.execute();

      expect(resultado).toHaveLength(0);
    });
  });

  describe('ListarUsuarioPorIdUseCase', () => {
    it('deve retornar usuario sem senha quando encontrado', async () => {
      mockRepository.findById.mockResolvedValue(mockUsuario);

      const resultado = await listarPorIdUseCase.execute('uuid-test');

      expect(resultado.id).toBe(mockUsuario.id);
      expect((resultado as any).senha).toBeUndefined();
    });

    it('deve lancar NotFoundException quando nao encontrar', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(listarPorIdUseCase.execute('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });

  describe('ListarUsuarioPorEmailUseCase', () => {
    it('deve retornar usuario por email sem senha', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUsuario);

      const resultado = await listarPorEmailUseCase.execute('teste@exemplo.com');

      expect(resultado.email).toBe(mockUsuario.email);
      expect((resultado as any).senha).toBeUndefined();
    });

    it('deve lancar NotFoundException quando email nao existe', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(listarPorEmailUseCase.execute('naoexiste@exemplo.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('AtualizarUsuarioUseCase', () => {
    it('deve atualizar campos e retorna usuario sem senha', async () => {
      const dto: AtualizarUsuarioDto = { nome: 'Nome Atualizado' };
      mockRepository.findById.mockResolvedValue(mockUsuario);
      mockRepository.update.mockResolvedValue({ ...mockUsuario, nome: 'Nome Atualizado' });

      const resultado = await atualizarUseCase.execute('uuid-test', dto);

      expect(resultado.nome).toBe('Nome Atualizado');
      expect((resultado as any).senha).toBeUndefined();
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('deve fazer hash da senha quando fornecida', async () => {
      const dto: AtualizarUsuarioDto = { senha: 'novaSenha123' };
      mockRepository.findById.mockResolvedValue(mockUsuario);
      mockRepository.update.mockResolvedValue(mockUsuario);

      await atualizarUseCase.execute('uuid-test', dto);

      expect(mockSenhaHash.hash).toHaveBeenCalledWith(dto.senha);
    });

    it('deve lancar NotFoundException quando usuario nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(atualizarUseCase.execute('uuid-invalido', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DeletarUsuarioUseCase', () => {
    it('deve fazer soft-delete atualizando deletedAt', async () => {
      mockRepository.findById.mockResolvedValue(mockUsuario);

      await deletarUseCase.execute('uuid-test');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('uuid-test');
    });

    it('deve lancar NotFoundException quando usuario nao existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(deletarUseCase.execute('uuid-invalido')).rejects.toThrow(NotFoundException);
    });
  });
});
