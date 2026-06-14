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
    const perfil = await this.prisma.perfil.findFirst({
      where: { id, deletedAt: null },
      include: { permissoes: true },
    });
    return perfil as Perfil | null;
  }

  async findByNome(nome: string): Promise<Perfil | null> {
    const perfil = await this.prisma.perfil.findFirst({
      where: { nome, deletedAt: null },
    });
    return perfil as Perfil | null;
  }

  async findAll(params?: { skip?: number; take?: number }): Promise<Perfil[]> {
    const perfis = await this.prisma.perfil.findMany({
      where: { deletedAt: null },
      include: { permissoes: true },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
    return perfis as Perfil[];
  }

  async count(): Promise<number> {
    return this.prisma.perfil.count({ where: { deletedAt: null } });
  }

  async create(data: CriarPerfilParams): Promise<Perfil> {
    const perfil = await this.prisma.perfil.create({
      data,
    });
    return perfil as Perfil;
  }

  async update(id: string, data: AtualizarPerfilParams): Promise<Perfil> {
    // Single-query: o use-case já fez findById (com deletedAt: null) e
    // lançou 404 se ausente. P2025 aqui = delete concorrente entre o
    // findById e este update — vira 404 via handlePrismaError no caller.
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
    // Mesma justificativa do update: use-case já fez findById, o handlePrismaError
    // no caller traduz P2025 em 404 se houver delete concorrente.
    const perfil = await this.prisma.perfil.update({
      where: { id },
      data: {
        permissoes: {
          set: permissoesIds.map((id) => ({ id })),
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
