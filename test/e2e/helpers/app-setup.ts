import * as dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../.env.e2e') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';

export async function createApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
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

  return { app, prisma };
}

export async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  await prisma.user.deleteMany({});
  await prisma.restaurante.deleteMany({});
  await prisma.perfil.updateMany({ data: { deletedAt: new Date() } });
  await prisma.permissao.updateMany({ data: { deletedAt: new Date() } });
  await prisma.perfil.deleteMany({});
  await prisma.permissao.deleteMany({});
}
