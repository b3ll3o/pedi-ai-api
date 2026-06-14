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
import { CriarPerfilUseCase } from '../../../application/perfis/usecases/criar-perfil.usecase';
import { ListarPerfisUseCase } from '../../../application/perfis/usecases/listar-perfis.usecase';
import { ListarPerfilPorIdUseCase } from '../../../application/perfis/usecases/listar-perfil-por-id.usecase';
import { AtualizarPerfilUseCase } from '../../../application/perfis/usecases/atualizar-perfil.usecase';
import { DeletarPerfilUseCase } from '../../../application/perfis/usecases/deletar-perfil.usecase';
import { AssociarPermissoesPerfilUseCase } from '../../../application/perfis/usecases/associar-permissoes-perfil.usecase';
import { DesassociarPermissaoPerfilUseCase } from '../../../application/perfis/usecases/desassociar-permissao-perfil.usecase';
import { ContarPerfisUseCase } from '../../../application/perfis/usecases/contar-perfis.usecase';
import {
  CriarPerfilDto,
  AtualizarPerfilDto,
  AssociarPermissoesDto,
} from '../../../application/perfis/dto/perfil.dto';
import { parsePagination } from '../../../common/pagination';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
@Controller('perfis')
export class PerfisController {
  constructor(
    private readonly criarPerfilUseCase: CriarPerfilUseCase,
    private readonly listarPerfisUseCase: ListarPerfisUseCase,
    private readonly listarPerfilPorIdUseCase: ListarPerfilPorIdUseCase,
    private readonly atualizarPerfilUseCase: AtualizarPerfilUseCase,
    private readonly deletarPerfilUseCase: DeletarPerfilUseCase,
    private readonly associarPermissoesPerfilUseCase: AssociarPermissoesPerfilUseCase,
    private readonly desassociarPermissaoPerfilUseCase: DesassociarPermissaoPerfilUseCase,
    private readonly contarPerfisUseCase: ContarPerfisUseCase,
  ) {}

  @Post()
  async criar(@Body() criarPerfilDto: CriarPerfilDto) {
    return this.criarPerfilUseCase.execute(criarPerfilDto);
  }

  @Get()
  async listarTodos(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.listarPerfisUseCase.execute(parsePagination(page, pageSize));
  }

  // Antes de `GET /:id` para não casar "count" como UUID (ParseUUIDPipe 400).
  @Get('count')
  async contar() {
    return { total: await this.contarPerfisUseCase.execute() };
  }

  @Get(':id')
  async listarUm(@Param('id', ParseUUIDPipe) id: string) {
    return this.listarPerfilPorIdUseCase.execute(id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() atualizarPerfilDto: AtualizarPerfilDto,
  ) {
    return this.atualizarPerfilUseCase.execute(id, atualizarPerfilDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseUUIDPipe) id: string) {
    return this.deletarPerfilUseCase.execute(id);
  }

  @Post(':id/permissoes')
  async associarPermissoes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() associarPermissoesDto: AssociarPermissoesDto,
  ) {
    return this.associarPermissoesPerfilUseCase.execute(id, associarPermissoesDto.permissoesIds);
  }

  @Delete(':id/permissoes/:permissaoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desassociarPermissao(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissaoId', ParseUUIDPipe) permissaoId: string,
  ) {
    return this.desassociarPermissaoPerfilUseCase.execute(id, permissaoId);
  }
}
