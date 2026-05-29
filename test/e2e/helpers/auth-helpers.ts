import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AuthToken } from './types';
import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';

export { AuthToken };

export async function loginAdmin(
  app: INestApplication,
  prisma: PrismaService,
): Promise<{ token: AuthToken; userId: string }> {
  const email = `admin-e2e-${Date.now()}@exemplo.com`;

  // Criar perfil ADMIN se não existir
  let perfilAdmin = await prisma.perfil.findFirst({
    where: { nome: 'ADMIN', deletedAt: null },
  });

  if (!perfilAdmin) {
    perfilAdmin = await prisma.perfil.create({
      data: { nome: 'ADMIN', descricao: 'Perfil Administrador' },
    });
  }

  await request(app.getHttpServer()).post('/users').send({
    nome: 'Usuario Admin E2E',
    email,
    senha: 'senha123',
  });

  // Associar perfil ADMIN ao usuário
  const usuario = await prisma.user.findUnique({ where: { email } });
  if (usuario) {
    await prisma.user.update({
      where: { id: usuario.id },
      data: { perfilId: perfilAdmin.id },
    });
  }

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha: 'senha123' });

  return {
    token: loginResponse.body as AuthToken,
    userId: usuario?.id || '',
  };
}

export async function loginUsuario(
  app: INestApplication,
  prisma: PrismaService,
): Promise<{ token: AuthToken; userId: string }> {
  const email = `usuario-e2e-${Date.now()}@exemplo.com`;

  // Criar perfil USUARIO se não existir
  let perfilUsuario = await prisma.perfil.findFirst({
    where: { nome: 'USUARIO', deletedAt: null },
  });

  if (!perfilUsuario) {
    perfilUsuario = await prisma.perfil.create({
      data: { nome: 'USUARIO', descricao: 'Perfil Usuario' },
    });
  }

  await request(app.getHttpServer()).post('/users').send({
    nome: 'Usuario Comum E2E',
    email,
    senha: 'senha123',
  });

  // Associar perfil USUARIO ao usuário
  const usuario = await prisma.user.findUnique({ where: { email } });
  if (usuario) {
    await prisma.user.update({
      where: { id: usuario.id },
      data: { perfilId: perfilUsuario.id },
    });
  }

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha: 'senha123' });

  return {
    token: loginResponse.body as AuthToken,
    userId: usuario?.id || '',
  };
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
