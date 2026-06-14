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
import { JwtAuthGuard } from '../../../presentation/auth/guards/jwt-auth.guard';
import { RolesAuthGuard } from '../../../presentation/auth/guards/roles-auth.guard';
import { RolesDecorators } from '../../../presentation/auth/decorators/roles.decorator';
import { Roles } from '../../../presentation/auth/enums/roles.enum';
import { CriarRestauranteUseCase } from '../../application/use-cases/criar-restaurante.usecase';
import { ListarRestaurantesUseCase } from '../../application/use-cases/listar-restaurantes.usecase';
import { ListarRestaurantePorIdUseCase } from '../../application/use-cases/listar-restaurante-por-id.usecase';
import { AtualizarRestauranteUseCase } from '../../application/use-cases/atualizar-restaurante.usecase';
import { DeletarRestauranteUseCase } from '../../application/use-cases/deletar-restaurante.usecase';
import { ContarRestaurantesUseCase } from '../../application/use-cases/contar-restaurantes.usecase';
import {
  CriarRestauranteDto,
  AtualizarRestauranteDto,
} from '../../application/dto/restaurante.dto';
import { parsePagination } from '../../../common/pagination';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
@Controller('restaurants')
export class RestaurantesController {
  constructor(
    private readonly criarRestauranteUseCase: CriarRestauranteUseCase,
    private readonly listarRestaurantesUseCase: ListarRestaurantesUseCase,
    private readonly listarRestaurantePorIdUseCase: ListarRestaurantePorIdUseCase,
    private readonly atualizarRestauranteUseCase: AtualizarRestauranteUseCase,
    private readonly deletarRestauranteUseCase: DeletarRestauranteUseCase,
    private readonly contarRestaurantesUseCase: ContarRestaurantesUseCase,
  ) {}

  @Post()
  async criar(@Body() criarRestauranteDto: CriarRestauranteDto) {
    return this.criarRestauranteUseCase.execute(criarRestauranteDto);
  }

  @Get()
  async listarTodos(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.listarRestaurantesUseCase.execute(parsePagination(page, pageSize));
  }

  // Antes de `GET /:id` para não casar "count" como UUID.
  @Get('count')
  async contar() {
    return { total: await this.contarRestaurantesUseCase.execute() };
  }

  @Get(':id')
  async listarUm(@Param('id', ParseUUIDPipe) id: string) {
    return this.listarRestaurantePorIdUseCase.execute(id);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() atualizarRestauranteDto: AtualizarRestauranteDto,
  ) {
    return this.atualizarRestauranteUseCase.execute(id, atualizarRestauranteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id', ParseUUIDPipe) id: string) {
    return this.deletarRestauranteUseCase.execute(id);
  }
}
