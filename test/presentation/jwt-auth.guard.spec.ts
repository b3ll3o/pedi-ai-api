import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/presentation/auth/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { userId: '123', email: 'test@test.com' };
      const result = guard.handleRequest(null, user);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => guard.handleRequest(null, undefined)).toThrow(UnauthorizedException);
    });

    it('should throw the original error when err is provided', () => {
      const originalError = new Error('Token expired');
      expect(() => guard.handleRequest(originalError, null)).toThrow(originalError);
    });

    it('should throw UnauthorizedException when user is falsy but not null', () => {
      expect(() => guard.handleRequest(null, false as any)).toThrow(UnauthorizedException);
    });
  });
});
