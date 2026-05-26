import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPerfisRepository } from '../../../../domain/interfaces/perfis-repository.interface';
import {
  Perfil,
  CriarPerfilParams,
  AtualizarPerfilParams,
} from '../../../../domain/entities/perfil.entity';
import { Permissao } from '../../../../domain/entities/permissao.entity';

@Injectable()
export class PerfisRepositoryImpl implements IPerfisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Perfil | null> {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id, deletedAt: null },
      include: { permissoes: true },
    });
    return perfil as Perfil | null;
  }

  async findByNome(nome: string): Promise<Perfil | null> {
    const perfil = await this.prisma.perfil.findUnique({
      where: { nome, deletedAt: null },
    });
    return perfil as Perfil | null;
  }

  async findAll(): Promise<Perfil[]> {
    const perfis = await this.prisma.perfil.findMany({
      where: { deletedAt: null },
      include: { permissoes: true },
    });
    return perfis as Perfil[];
  }

  async create(data: CriarPerfilParams): Promise<Perfil> {
    const perfil = await this.prisma.perfil.create({
      data,
    });
    return perfil as Perfil;
  }

  async update(id: string, data: AtualizarPerfilParams): Promise<Perfil> {
    const perfil = await this.prisma.perfil.update({
      where: { id },
      data,
      include: { permissoes: true },
    });
    return perfil as Perfil;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.perfil.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async associarPermissoes(id: string, permissoesIds: string[]): Promise<Perfil> {
    const perfil = await this.prisma.perfil.update({
      where: { id },
      data: {
        permissoes: {
          connect: permissoesIds.map((id) => ({ id })),
        },
      },
      include: { permissoes: true },
    });
    return perfil as Perfil;
  }

  async desassociarPermissao(id: string, permissaoId: string): Promise<void> {
    await this.prisma.perfil.update({
      where: { id },
      data: {
        permissoes: {
          disconnect: { id: permissaoId },
        },
      },
    });
  }

  async findPermissoesByIds(ids: string[]): Promise<Permissao[]> {
    const permissoes = await this.prisma.permissao.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    return permissoes as Permissao[];
  }
}
