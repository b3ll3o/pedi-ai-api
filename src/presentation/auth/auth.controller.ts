import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../../application/auth/dto/login.dto';
import { RefreshTokenDto } from '../../application/auth/dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    perfilId: string | null;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logout realizado com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const usuario = await this.authService.validateUser(req.user.userId);
    return {
      id: usuario?.id,
      nome: usuario?.nome,
      email: usuario?.email,
      perfil: usuario?.perfilId ? { id: usuario.perfilId } : null,
      createdAt: usuario?.createdAt,
      updatedAt: usuario?.updatedAt,
    };
  }
}
