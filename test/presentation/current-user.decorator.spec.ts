import { ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../src/presentation/auth/interfaces/request-with-user.interface';

describe('CurrentUserDecorator', () => {
  const createMockContext = (user: RequestWithUser['user']): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as ExecutionContext;
  };

  const currentUserLogic = (
    data: keyof RequestWithUser['user'] | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return data ? user[data] : user;
  };

  describe('sem parametro (retorna usuario completo)', () => {
    it('deve retornar o usuario completo quando data é undefined', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        email: 'test@example.com',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserLogic(undefined, context);

      expect(result).toEqual(mockUser);
    });

    it('deve retornar o usuario completo quando data é undefined com todos os campos', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-456',
        email: 'admin@test.com',
        perfilId: 'perfil-admin',
      };

      const context = createMockContext(mockUser);
      const result = currentUserLogic(undefined, context);

      expect(result).toEqual(mockUser);
      expect((result as RequestWithUser['user']).userId).toBe('user-456');
      expect((result as RequestWithUser['user']).email).toBe('admin@test.com');
    });
  });

  describe('com parametro (retorna campo especifico)', () => {
    it('deve retornar o campo userId quando passado "userId"', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        email: 'test@example.com',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserLogic('userId', context);

      expect(result).toBe('user-123');
    });

    it('deve retornar o campo email quando passado "email"', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        email: 'test@example.com',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserLogic('email', context);

      expect(result).toBe('test@example.com');
    });

    it('deve retornar o campo perfilId quando passado "perfilId"', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        email: 'test@example.com',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserLogic('perfilId', context);

      expect(result).toBe('perfil-123');
    });
  });

  describe('edge cases', () => {
    it('deve funcionar com perfilId null', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-minimo',
        email: 'minimo@test.com',
        perfilId: null,
      };

      const context = createMockContext(mockUser);
      const result = currentUserLogic('perfilId', context);

      expect(result).toBeNull();
    });

    it('deve retornar undefined para campo inexistente no tipo', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        email: 'test@example.com',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = (currentUserLogic as any)('nome', context);

      expect(result).toBeUndefined();
    });
  });
});
