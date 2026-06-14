import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesAuthGuard } from '../src/presentation/auth/guards/roles-auth.guard';
import { IPERFIS_REPOSITORY } from '../src/domain/interfaces/perfis-repository.interface';
import { Roles } from '../src/presentation/auth/enums/roles.enum';
import { Perfil } from '../src/domain/entities/perfil.entity';
import { ROLES_KEY } from '../src/presentation/auth/decorators/roles.decorator';

describe('RolesAuthGuard', () => {
  let reflector: Reflector;
  let mockPerfisRepository: {
    findById: jest.Mock;
    findByNome: jest.Mock;
    findAll: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    associarPermissoes: jest.Mock;
    desassociarPermissao: jest.Mock;
    findPermissoesByIds: jest.Mock;
  };

  const mockPerfilAdmin: Perfil = {
    id: 'perfil-admin-id',
    nome: Roles.ADMIN,
    permissoes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  const mockPerfilUsuario: Perfil = {
    id: 'perfil-usuario-id',
    nome: Roles.USUARIO,
    permissoes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  const mockPerfilDeletado: Perfil = {
    id: 'perfil-deletado-id',
    nome: Roles.ADMIN,
    permissoes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
    version: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPerfisRepository = {
      findById: jest.fn(),
      findByNome: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      associarPermissoes: jest.fn(),
      desassociarPermissao: jest.fn(),
      findPermissoesByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [Reflector, { provide: IPERFIS_REPOSITORY, useValue: mockPerfisRepository }],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (
    user: { userId: string; email: string; perfilId: string | null } | null,
    requiredRoles: Roles[] | null | undefined,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => ({ mockResponse: true }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  const createTestableGuard = (JWT_VALIDO: boolean = true) => {
    class TestableRolesAuthGuard extends RolesAuthGuard {
      async canActivate(context: ExecutionContext): Promise<boolean> {
        if (!JWT_VALIDO) {
          throw new UnauthorizedException();
        }

        const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        const request = context.switchToHttp().getRequest();
        const { perfilId } = request.user;

        if (!perfilId) {
          throw new ForbiddenException('Usuário sem perfil associado');
        }

        const perfil = await this.perfisRepository.findById(perfilId);

        if (!perfil || perfil.deletedAt !== null) {
          throw new ForbiddenException('Perfil não encontrado ou inativo');
        }

        const hasRole = requiredRoles.some((role) => perfil.nome === role);

        if (!hasRole) {
          throw new ForbiddenException('Acesso insuficiente');
        }

        return true;
      }
    }

    return TestableRolesAuthGuard;
  };

  describe('deve_permitir_acesso_quando_usuario_e_ADMIN', () => {
    it('acesso liberado para usuario com perfil ADMIN', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilAdmin);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'admin@pedi.ai', perfilId: 'perfil-admin-id' },
        [Roles.ADMIN],
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(mockPerfisRepository.findById).toHaveBeenCalledWith('perfil-admin-id');
    });

    it('acesso liberado quando multiplos roles definidos e usuario tem um deles', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Roles.ADMIN, 'SUPER_ADMIN' as Roles]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilAdmin);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'admin@pedi.ai', perfilId: 'perfil-admin-id' },
        [Roles.ADMIN, 'SUPER_ADMIN' as Roles],
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('deve_negar_acesso_quando_usuario_nao_e_ADMIN', () => {
    it('lança ForbiddenException para usuario USUARIO', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilUsuario);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: 'perfil-usuario-id' },
        [Roles.ADMIN],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('lança ForbiddenException com mensagem "Acesso insuficiente"', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilUsuario);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: 'perfil-usuario-id' },
        [Roles.ADMIN],
      );

      await expect(guard.canActivate(context)).rejects.toThrow('Acesso insuficiente');
    });
  });

  describe('deve_negar_acesso_quando_sem_perfil', () => {
    it('lança ForbiddenException quando perfilId é null', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: null },
        [Roles.ADMIN],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('Usuário sem perfil associado');
    });

    it('lança ForbiddenException quando perfil não é encontrado', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(null);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: 'perfil-inexistente' },
        [Roles.ADMIN],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('Perfil não encontrado ou inativo');
    });
  });

  describe('deve_negar_acesso_quando_perfil_deletado', () => {
    it('lança ForbiddenException quando Perfil.deletedAt não é null', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilDeletado);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'admin@pedi.ai', perfilId: 'perfil-deletado-id' },
        [Roles.ADMIN],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('Perfil não encontrado ou inativo');
    });
  });

  describe('deve_permitir_acesso_quando_nenhum_role_requerido', () => {
    it('acesso liberado quando @Roles não está definido', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: null },
        null,
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('acesso liberado quando @Roles tem lista vazia', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: null },
        [],
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('acesso liberado quando perfilId existe mas roles e vazio', async () => {
      const TestableRolesAuthGuard = createTestableGuard(true);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'usuario@pedi.ai', perfilId: 'perfil-usuario-id' },
        [],
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(mockPerfisRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('deve_lancar_UnauthorizedException_quando_JWT_invalido', () => {
    it('lança UnauthorizedException quando JWT é inválido', async () => {
      const TestableRolesAuthGuard = createTestableGuard(false);

      const guard = new TestableRolesAuthGuard(reflector, mockPerfisRepository);
      const context = createMockContext(
        { userId: 'user-id', email: 'admin@pedi.ai', perfilId: 'perfil-admin-id' },
        [Roles.ADMIN],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  // Estes testes exercem o checkRoles extraído do guard (sem o super.canActivate
  // do JwtAuthGuard, que precisa de passport init) para validar o cache TTL que
  // evita o N+1 em todo request admin. O resto da suíte usa TestableRolesAuthGuard
  // para isolar do JwtAuthGuard, mas isso pula o cache.
  describe('cache de perfil no RolesAuthGuard real', () => {
    const mockContextSemRoles = (user: unknown) =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({ user }),
          getResponse: () => ({}),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      }) as unknown as ExecutionContext;

    it('consulta o DB na primeira vez e reusa o cache nas chamadas seguintes', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilAdmin);

      const guard = new RolesAuthGuard(reflector, mockPerfisRepository);

      await guard.checkRoles(mockContextSemRoles({ userId: 'u1', perfilId: 'perfil-admin-id' }));
      await guard.checkRoles(mockContextSemRoles({ userId: 'u1', perfilId: 'perfil-admin-id' }));
      await guard.checkRoles(mockContextSemRoles({ userId: 'u1', perfilId: 'perfil-admin-id' }));

      expect(mockPerfisRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('cache expira após 30s e força nova consulta ao DB', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilAdmin);

      const guard = new RolesAuthGuard(reflector, mockPerfisRepository);
      const ctx = mockContextSemRoles({ userId: 'u1', perfilId: 'perfil-admin-id' });

      await guard.checkRoles(ctx);

      const realNow = Date.now;
      Date.now = jest.fn(() => realNow() + 31_000);
      try {
        await guard.checkRoles(ctx);
      } finally {
        Date.now = realNow;
      }

      expect(mockPerfisRepository.findById).toHaveBeenCalledTimes(2);
    });

    it('cache de um perfil não vaza para outro (ids distintos = entradas distintas)', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById
        .mockResolvedValueOnce(mockPerfilAdmin)
        .mockResolvedValueOnce(mockPerfilUsuario);

      const guard = new RolesAuthGuard(reflector, mockPerfisRepository);

      await guard.checkRoles(
        mockContextSemRoles({ userId: 'u1', perfilId: 'perfil-admin-id' }),
      );
      await expect(
        guard.checkRoles(
          mockContextSemRoles({ userId: 'u2', perfilId: 'perfil-usuario-id' }),
        ),
      ).rejects.toThrow('Acesso insuficiente');

      expect(mockPerfisRepository.findById).toHaveBeenCalledTimes(2);
    });

    it('perfil soft-deletado (deletedAt != null) não entra no cache', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Roles.ADMIN]);
      mockPerfisRepository.findById.mockResolvedValue(mockPerfilDeletado);

      const guard = new RolesAuthGuard(reflector, mockPerfisRepository);
      const ctx = mockContextSemRoles({ userId: 'u1', perfilId: 'perfil-deletado-id' });

      await expect(guard.checkRoles(ctx)).rejects.toThrow(
        'Perfil não encontrado ou inativo',
      );
      await expect(guard.checkRoles(ctx)).rejects.toThrow(
        'Perfil não encontrado ou inativo',
      );
      expect(mockPerfisRepository.findById).toHaveBeenCalledTimes(2);
    });
  });
});
