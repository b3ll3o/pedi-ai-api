import { ExecutionContext } from '@nestjs/common';
import { currentUserFactory } from '../../src/presentation/auth/decorators/current-user.decorator';
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

  describe('sem parametro (retorna usuario completo)', () => {
    it('deve retornar o usuario completo quando data é undefined', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserFactory(undefined, context);

      expect(result).toEqual(mockUser);
    });

    it('deve retornar o usuario completo com todos os campos', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-456',
        perfilId: 'perfil-admin',
      };

      const context = createMockContext(mockUser);
      const result = currentUserFactory(undefined, context);

      expect(result).toEqual(mockUser);
      expect((result as RequestWithUser['user']).userId).toBe('user-456');
      expect((result as RequestWithUser['user']).perfilId).toBe('perfil-admin');
    });
  });

  describe('com parametro (retorna campo especifico)', () => {
    it('deve retornar o campo userId quando passado "userId"', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserFactory('userId', context);

      expect(result).toBe('user-123');
    });

    it('deve retornar o campo perfilId quando passado "perfilId"', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-123',
        perfilId: 'perfil-123',
      };

      const context = createMockContext(mockUser);
      const result = currentUserFactory('perfilId', context);

      expect(result).toBe('perfil-123');
    });
  });

  describe('edge cases', () => {
    it('deve funcionar com perfilId null', () => {
      const mockUser: RequestWithUser['user'] = {
        userId: 'user-minimo',
        perfilId: null,
      };

      const context = createMockContext(mockUser);
      const result = currentUserFactory('perfilId', context);

      expect(result).toBeNull();
    });
  });
});
