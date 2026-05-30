import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import {
  IRestaurantesRepository,
  CreateRestauranteInput,
  UpdateRestauranteInput,
  Restaurante,
} from '../../domain/repositories/restaurantes-repository.interface';

@Injectable()
export class RestaurantesRepositoryImpl implements IRestaurantesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRestauranteInput): Promise<Restaurante> {
    const restaurante = await this.prisma.restaurante.create({ data });
    return restaurante as Restaurante;
  }

  async findAll(): Promise<Restaurante[]> {
    const restaurantes = await this.prisma.restaurante.findMany({
      where: { deletedAt: null, ativo: true },
      orderBy: { nome: 'asc' },
    });
    return restaurantes as Restaurante[];
  }

  async findById(id: string): Promise<Restaurante | null> {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { id, deletedAt: null },
    });
    return restaurante as Restaurante | null;
  }

  async findByCnpj(cnpj: string): Promise<Restaurante | null> {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { cnpj },
    });
    return restaurante as Restaurante | null;
  }

  async update(id: string, data: UpdateRestauranteInput): Promise<Restaurante> {
    const restaurante = await this.prisma.restaurante.update({
      where: { id },
      data,
    });
    return restaurante as Restaurante;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.restaurante.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
