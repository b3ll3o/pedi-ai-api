import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from '../../application/auth/dto/login.dto';
import { RegisterDto } from '../../application/auth/dto/register.dto';
import { RefreshTokenDto } from '../../application/auth/dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    perfilId: string | null;
  };
}

// Throttler por rota lê as mesmas env vars do AppModule (THROTTLE_SHORT_LIMIT /
// THROTTLE_LONG_LIMIT) para que o override por @Throttle não hardcode um limite
// que não pode ser desativado em E2E. Em produção real, basta NÃO setar as
// env vars para usar os defaults abaixo.
const envInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const AUTH_LOGIN_SHORT = envInt('THROTTLE_SHORT_LIMIT', 3);
const AUTH_LOGIN_LONG = envInt('THROTTLE_LONG_LIMIT', 10);
const AUTH_REFRESH_SHORT = envInt('THROTTLE_SHORT_LIMIT', 5);
const AUTH_REFRESH_LONG = envInt('THROTTLE_LONG_LIMIT', 20);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    short: { limit: AUTH_LOGIN_SHORT, ttl: 60_000 },
    long: { limit: AUTH_LOGIN_LONG, ttl: 3_600_000 },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Throttle({
    short: { limit: AUTH_LOGIN_SHORT, ttl: 60_000 },
    long: { limit: AUTH_LOGIN_LONG, ttl: 3_600_000 },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    short: { limit: AUTH_REFRESH_SHORT, ttl: 60_000 },
    long: { limit: AUTH_REFRESH_LONG, ttl: 3_600_000 },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthenticatedRequest) {
    const authHeader = (req.headers as unknown as Record<string, string | undefined>)[
      'authorization'
    ];
    const accessToken =
      typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
    await this.authService.logout(req.user.userId, accessToken);
    return { message: 'Logout realizado com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const usuario = await this.authService.validateUser(req.user.userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil ? { id: usuario.perfil.id, nome: usuario.perfil.nome } : null,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    };
  }
}
