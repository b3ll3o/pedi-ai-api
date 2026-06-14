import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesAuthGuard } from '../../auth/guards/roles-auth.guard';
import { RolesDecorators } from '../../auth/decorators/roles.decorator';
import { Roles } from '../../auth/enums/roles.enum';
import { CriarUsuarioUseCase } from '../../../application/usuarios/usecases/criar-usuario.usecase';
import { ListarUsuariosUseCase } from '../../../application/usuarios/usecases/listar-usuarios.usecase';
import { ListarUsuarioPorIdUseCase } from '../../../application/usuarios/usecases/listar-usuario-por-id.usecase';
import { ListarUsuarioPorEmailUseCase } from '../../../application/usuarios/usecases/listar-usuario-por-email.usecase';
import { AtualizarUsuarioUseCase } from '../../../application/usuarios/usecases/atualizar-usuario.usecase';
import { DeletarUsuarioUseCase } from '../../../application/usuarios/usecases/deletar-usuario.usecase';
import { ContarUsuariosUseCase } from '../../../application/usuarios/usecases/contar-usuarios.usecase';
import { CriarUsuarioDto } from '../../../application/usuarios/dto/criar-usuario.dto';
import { AtualizarUsuarioDto } from '../../../application/usuarios/dto/atualizar-usuario.dto';
import { parsePagination } from '../../../common/pagination';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
@Controller('users')
export class UsuariosController {
  constructor(
    private readonly criarUsuarioUseCase: CriarUsuarioUseCase,
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
    private readonly listarUsuarioPorIdUseCase: ListarUsuarioPorIdUseCase,
    private readonly listarUsuarioPorEmailUseCase: ListarUsuarioPorEmailUseCase,
    private readonly atualizarUsuarioUseCase: AtualizarUsuarioUseCase,
    private readonly deletarUsuarioUseCase: DeletarUsuarioUseCase,
    private readonly contarUsuariosUseCase: ContarUsuariosUseCase,
  ) {}

  @Post()
  async criar(@Body() criarUsuarioDto: CriarUsuarioDto) {
    return this.criarUsuarioUseCase.execute(criarUsuarioDto);
  }

  @Get()
  async listarTodos(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.listarUsuariosUseCase.execute(parsePagination(page, pageSize));
  }

  // Antes de `GET /:id` para que o Nest não tente casar "count" como UUID
  // e dispare um ParseUUIDPipe 400.
  @Get('count')
  async contar() {
    return { total: await this.contarUsuariosUseCase.execute() };
  }

  @Get(':id')
  async listarUm(@Param('id', ParseUUIDPipe) id: string) {
    return this.listarUsuarioPorIdUseCase.execute(id);
  }

  @Get('email/:email')
  async listarPorEmail(@Param('email') email: string) {
    return this.listarUsuarioPorEmailUseCase.execute(email);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto,
  ) {
    return this.atualizarUsuarioUseCase.execute(id, atualizarUsuarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseUUIDPipe) id: string) {
    return this.deletarUsuarioUseCase.execute(id);
  }
}
