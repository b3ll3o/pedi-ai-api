import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesAuthGuard } from '../../auth/guards/roles-auth.guard';
import { RolesDecorators } from '../../auth/decorators/roles.decorator';
import { Roles } from '../../auth/enums/roles.enum';
import { CriarPermissaoUseCase } from '../../../application/permissoes/usecases/criar-permissao.usecase';
import { ListarPermissoesUseCase } from '../../../application/permissoes/usecases/listar-permissoes.usecase';
import { ListarPermissaoPorIdUseCase } from '../../../application/permissoes/usecases/listar-permissao-por-id.usecase';
import { AtualizarPermissaoUseCase } from '../../../application/permissoes/usecases/atualizar-permissao.usecase';
import { DeletarPermissaoUseCase } from '../../../application/permissoes/usecases/deletar-permissao.usecase';
import {
  CriarPermissaoDto,
  AtualizarPermissaoDto,
} from '../../../application/permissoes/dto/permissao.dto';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
@Controller('permissoes')
export class PermissoesController {
  constructor(
    private readonly criarPermissaoUseCase: CriarPermissaoUseCase,
    private readonly listarPermissoesUseCase: ListarPermissoesUseCase,
    private readonly listarPermissaoPorIdUseCase: ListarPermissaoPorIdUseCase,
    private readonly atualizarPermissaoUseCase: AtualizarPermissaoUseCase,
    private readonly deletarPermissaoUseCase: DeletarPermissaoUseCase,
  ) {}

  @Post()
  async criar(@Body() criarPermissaoDto: CriarPermissaoDto) {
    return this.criarPermissaoUseCase.execute(criarPermissaoDto);
  }

  @Get()
  async listarTodos() {
    return this.listarPermissoesUseCase.execute();
  }

  @Get(':id')
  async listarUm(@Param('id') id: string) {
    return this.listarPermissaoPorIdUseCase.execute(id);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() atualizarPermissaoDto: AtualizarPermissaoDto) {
    return this.atualizarPermissaoUseCase.execute(id, atualizarPermissaoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id') id: string) {
    return this.deletarPermissaoUseCase.execute(id);
  }
}
