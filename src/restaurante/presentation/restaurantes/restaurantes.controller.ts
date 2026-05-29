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
import { JwtAuthGuard } from '../../../presentation/auth/guards/jwt-auth.guard';
import { RolesAuthGuard } from '../../../presentation/auth/guards/roles-auth.guard';
import { RolesDecorators } from '../../../presentation/auth/decorators/roles.decorator';
import { Roles } from '../../../presentation/auth/enums/roles.enum';
import { CriarRestauranteUseCase } from '../../application/use-cases/criar-restaurante.usecase';
import { ListarRestaurantesUseCase } from '../../application/use-cases/listar-restaurantes.usecase';
import { ListarRestaurantePorIdUseCase } from '../../application/use-cases/listar-restaurante-por-id.usecase';
import { AtualizarRestauranteUseCase } from '../../application/use-cases/atualizar-restaurante.usecase';
import { DeletarRestauranteUseCase } from '../../application/use-cases/deletar-restaurante.usecase';
import { CriarRestauranteDto, AtualizarRestauranteDto } from '../../application/dto/restaurante.dto';

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
  ) {}

  @Post()
  async criar(@Body() criarRestauranteDto: CriarRestauranteDto) {
    return this.criarRestauranteUseCase.execute(criarRestauranteDto);
  }

  @Get()
  async listarTodos() {
    return this.listarRestaurantesUseCase.execute();
  }

  @Get(':id')
  async listarUm(@Param('id') id: string) {
    return this.listarRestaurantePorIdUseCase.execute(id);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() atualizarRestauranteDto: AtualizarRestauranteDto) {
    return this.atualizarRestauranteUseCase.execute(id, atualizarRestauranteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id') id: string) {
    return this.deletarRestauranteUseCase.execute(id);
  }
}