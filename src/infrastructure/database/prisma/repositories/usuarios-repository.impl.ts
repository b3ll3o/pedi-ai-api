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
    const usuario = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { perfil: true },
    });
    return usuario as Usuario | null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const normalized = email.toLowerCase().trim();
    const usuario = await this.prisma.user.findUnique({
      where: { email: normalized, deletedAt: null },
    });
    return usuario as Usuario | null;
  }

  async findByEmailIncludingDeleted(email: string): Promise<Usuario | null> {
    const normalized = email.toLowerCase().trim();
    const usuario = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    return usuario as Usuario | null;
  }

  async findAll(params?: { skip?: number; take?: number }): Promise<Usuario[]> {
    const usuarios = await this.prisma.user.findMany({
      where: { deletedAt: null },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
    return usuarios as Usuario[];
  }

  async create(data: CriarUsuarioParams): Promise<Usuario> {
    const usuario = await this.prisma.user.create({
      data,
    });
    return usuario as Usuario;
  }

  async update(id: string, data: AtualizarUsuarioParams): Promise<Usuario> {
    const usuario = await this.prisma.user.update({
      where: { id, deletedAt: null },
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
