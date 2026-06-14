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

  async findAll(params?: { skip?: number; take?: number }): Promise<Restaurante[]> {
    const restaurantes = await this.prisma.restaurante.findMany({
      where: { deletedAt: null, ativo: true },
      orderBy: { nome: 'asc' },
      skip: params?.skip,
      take: params?.take,
    });
    return restaurantes as Restaurante[];
  }

  async count(): Promise<number> {
    return this.prisma.restaurante.count({ where: { deletedAt: null, ativo: true } });
  }

  async findById(id: string): Promise<Restaurante | null> {
    const restaurante = await this.prisma.restaurante.findFirst({
      where: { id, deletedAt: null },
    });
    return restaurante as Restaurante | null;
  }

  async findByCnpj(cnpj: string): Promise<Restaurante | null> {
    const restaurante = await this.prisma.restaurante.findFirst({
      where: { cnpj, deletedAt: null },
    });
    return restaurante as Restaurante | null;
  }

  async update(id: string, data: UpdateRestauranteInput): Promise<Restaurante> {
    // Single-query: o use-case já fez findById. P2025 aqui = delete
    // concorrente → 404 via handlePrismaError no caller.
    const restaurante = await this.prisma.restaurante.update({
      where: { id },
      data,
    });
    return restaurante as Restaurante;
  }

  async softDelete(id: string): Promise<void> {
    // `ativo: false` deliberadamente não é setado aqui: findAll já filtra por
    // `ativo: true` e o registro sai da listagem pelo `deletedAt: null`. Setar
    // os dois desnecessariamente acopla o soft-delete ao flag de negócio e
    // quebra a possibilidade de o admin "ressuscitar" um restaurante só
    // limpando o `deletedAt` (o `ativo: false` ficaria como lixo).
    await this.prisma.restaurante.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
