import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IPermissoesRepository } from '../../../../domain/interfaces/permissoes-repository.interface';
import {
  Permissao,
  CriarPermissaoParams,
  AtualizarPermissaoParams,
} from '../../../../domain/entities/permissao.entity';

@Injectable()
export class PermissoesRepositoryImpl implements IPermissoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Permissao | null> {
    const permissao = await this.prisma.permissao.findFirst({
      where: { id, deletedAt: null },
      include: { perfis: true },
    });
    return permissao as Permissao | null;
  }

  async findByNomeOrChave(nome: string, chave: string): Promise<Permissao | null> {
    const permissao = await this.prisma.permissao.findFirst({
      where: {
        OR: [{ nome }, { chave }],
        deletedAt: null,
      },
    });
    return permissao as Permissao | null;
  }

  async findAll(params?: { skip?: number; take?: number }): Promise<Permissao[]> {
    const permissoes = await this.prisma.permissao.findMany({
      where: { deletedAt: null },
      include: { perfis: true },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
    return permissoes as Permissao[];
  }

  async count(): Promise<number> {
    return this.prisma.permissao.count({ where: { deletedAt: null } });
  }

  async create(data: CriarPermissaoParams): Promise<Permissao> {
    const permissao = await this.prisma.permissao.create({
      data,
    });
    return permissao as Permissao;
  }

  async update(id: string, data: AtualizarPermissaoParams): Promise<Permissao> {
    // Single-query: o use-case já fez findById. P2025 aqui = delete
    // concorrente → 404 via handlePrismaError no caller.
    const permissao = await this.prisma.permissao.update({
      where: { id },
      data,
      include: { perfis: true },
    });
    return permissao as Permissao;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.permissao.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
