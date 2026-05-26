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
} from '@nestjs/common';
import { CriarPerfilUseCase } from '../../../application/perfis/usecases/criar-perfil.usecase';
import { ListarPerfisUseCase } from '../../../application/perfis/usecases/listar-perfis.usecase';
import { ListarPerfilPorIdUseCase } from '../../../application/perfis/usecases/listar-perfil-por-id.usecase';
import { AtualizarPerfilUseCase } from '../../../application/perfis/usecases/atualizar-perfil.usecase';
import { DeletarPerfilUseCase } from '../../../application/perfis/usecases/deletar-perfil.usecase';
import { AssociarPermissoesPerfilUseCase } from '../../../application/perfis/usecases/associar-permissoes-perfil.usecase';
import { DesassociarPermissaoPerfilUseCase } from '../../../application/perfis/usecases/desassociar-permissao-perfil.usecase';
import { CriarPerfilDto, AtualizarPerfilDto, AssociarPermissoesDto } from '../../../application/perfis/dto/perfil.dto';

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
  ) {}

  @Post()
  async criar(@Body() criarPerfilDto: CriarPerfilDto) {
    return this.criarPerfilUseCase.execute(criarPerfilDto);
  }

  @Get()
  async listarTodos() {
    return this.listarPerfisUseCase.execute();
  }

  @Get(':id')
  async listarUm(@Param('id') id: string) {
    return this.listarPerfilPorIdUseCase.execute(id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarPerfilDto: AtualizarPerfilDto,
  ) {
    return this.atualizarPerfilUseCase.execute(id, atualizarPerfilDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id') id: string) {
    return this.deletarPerfilUseCase.execute(id);
  }

  @Post(':id/permissoes')
  async associarPermissoes(
    @Param('id') id: string,
    @Body() associarPermissoesDto: AssociarPermissoesDto,
  ) {
    return this.associarPermissoesPerfilUseCase.execute(id, associarPermissoesDto.permissoesIds);
  }

  @Delete(':id/permissoes/:permissaoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desassociarPermissao(
    @Param('id') id: string,
    @Param('permissaoId') permissaoId: string,
  ) {
    return this.desassociarPermissaoPerfilUseCase.execute(id, permissaoId);
  }
}