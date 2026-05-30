import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env.e2e' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { getAuthToken } from './auth.helper';

export interface TestSetup {
  app: INestApplication;
  authToken: string;
  prisma: PrismaService;
}

export async function setupTestApp(): Promise<TestSetup> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  const prisma = app.get(PrismaService);
  await cleanupDatabase(prisma);
  const authToken = await seedAdminUserAndGetToken(app, prisma);

  return { app, authToken, prisma };
}

export async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.perfil.updateMany({ data: { deletedAt: null } });
  await prisma.permissao.updateMany({ data: { deletedAt: null } });
  await prisma.perfil.deleteMany({});
  await prisma.permissao.deleteMany({});
}

export async function seedAdminUserAndGetToken(
  app: INestApplication,
  prisma: PrismaService,
): Promise<string> {
  const bcrypt = require('bcrypt');
  const hashedSenha = await bcrypt.hash('admin123', 10);

  const perfilAdmin = await prisma.perfil.create({
    data: { nome: 'ADMIN' },
  });

  await prisma.user.create({
    data: {
      nome: 'Admin Test',
      email: 'admin@pedi.ai',
      senha: hashedSenha,
      perfilId: perfilAdmin.id,
    },
  });

  return getAuthToken(app, {
    email: 'admin@pedi.ai',
    senha: 'admin123',
    nome: 'Admin Test',
  });
}
