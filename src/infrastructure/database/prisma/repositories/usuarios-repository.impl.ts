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
    });
    return usuario as Usuario | null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.user.findUnique({
      where: { email },
    });
    return usuario as Usuario | null;
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await this.prisma.user.findMany({
      where: { deletedAt: null },
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
