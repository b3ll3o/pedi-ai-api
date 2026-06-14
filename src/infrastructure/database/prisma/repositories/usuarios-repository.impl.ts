import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUsuariosRepository } from '../../../../domain/interfaces/usuarios-repository.interface';
import {
  Usuario,
  CriarUsuarioParams,
  AtualizarUsuarioParams,
} from '../../../../domain/entities/usuario.entity';

@Injectable()
export class UsuariosRepositoryImpl implements IUsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Usuario | null> {
    // findUnique não aceita filtros não-únicos no `where` (Prisma rejeita
    // `deletedAt: null` em colunas que não fazem parte de índice único). Usamos
    // findFirst com o mesmo efeito: localização por id + filtro de soft-delete.
    const usuario = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { perfil: true },
    });
    return usuario as Usuario | null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const normalized = email.toLowerCase().trim();
    const usuario = await this.prisma.user.findFirst({
      where: { email: normalized, deletedAt: null },
    });
    return usuario as Usuario | null;
  }

  async findByEmailIncludingDeleted(email: string): Promise<Usuario | null> {
    const normalized = email.toLowerCase().trim();
    const usuario = await this.prisma.user.findFirst({
      where: { email: normalized },
    });
    return usuario as Usuario | null;
  }

  async findAll(params?: { skip?: number; take?: number }): Promise<Usuario[]> {
    // `select` em vez de map() no caller: bcrypt.hash + transfer são
    // ~60B por linha. Em uma listagem de 100 usuários, isso é ~6KB a menos
    // no payload + evita expor o hash mesmo se um caller futuro esquecer
    // de filtrar. O caller pode re-trazer via findById quando precisar.
    const usuarios = await this.prisma.user.findMany({
      where: { deletedAt: null },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfilId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        version: true,
        perfil: { select: { id: true, nome: true } },
      },
    });
    return usuarios as Usuario[];
  }

  async count(): Promise<number> {
    // Bate direto no índice `users_deleted_at_idx` que criamos na migration
    // add_perf_indexes. ~100x mais rápido que carregar a lista só pra
    // contar (que era o que o dashboard fazia).
    return this.prisma.user.count({ where: { deletedAt: null } });
  }

  async create(data: CriarUsuarioParams): Promise<Usuario> {
    const usuario = await this.prisma.user.create({
      data,
    });
    return usuario as Usuario;
  }

  async update(id: string, data: AtualizarUsuarioParams): Promise<Usuario> {
    // Single-query update: o use-case já valida existência via findById antes
    // de chamar update, então um P2025 aqui significa delete concorrente
    // entre o findById e este update — vira 404 via handlePrismaError no caller.
    // Prisma 5+ aceita `where: { id }` puro (id é unique) sem filtro deletedAt:
    // o filtro de soft-delete é responsabilidade do use-case (que faz findById
    // com `deletedAt: null`). Manter findFirst+update aqui duplicava 1 SELECT
    // por request sem benefício (o use-case já fez a mesma checagem).
    const usuario = await this.prisma.user.update({
      where: { id },
      data,
    });
    return usuario as Usuario;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
