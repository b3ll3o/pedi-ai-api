import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env.e2e' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

describe('Permissoes E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany({});
    // Limpar associacoes atraves de perfis e permissoes
    await prisma.perfil.updateMany({
      data: { deletedAt: new Date() }
    });
    await prisma.permissao.updateMany({
      data: { deletedAt: new Date() }
    });
    await prisma.perfil.deleteMany({});
    await prisma.permissao.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /permissoes', () => {
    it('deve criar permissao com dados validos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Criar Usuario',
          chave: 'usuario:criar',
          descricao: 'Permite criar usuarios',
        })
        .expect(201);

      expect(resposta.body.nome).toBe('Criar Usuario');
      expect(resposta.body.chave).toBe('usuario:criar');
      expect(resposta.body.id).toBeDefined();
    });

    it('deve retornar 409 para nome duplicado', async () => {
      await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Nome Duplicado',
          chave: 'teste:duplicado1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Nome Duplicado',
          chave: 'teste:duplicado2',
        })
        .expect(409);
    });

    it('deve retornar 409 para chave duplicada', async () => {
      await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Nome Diferente 1',
          chave: 'chave:unica1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Nome Diferente 2',
          chave: 'chave:unica1',
        })
        .expect(409);
    });

    it('deve retornar 400 para chave com formato invalido', async () => {
      await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Permissao Invalida',
          chave: 'formato-invalido',
        })
        .expect(400);
    });
  });

  describe('GET /permissoes', () => {
    it('deve listar todas as permissoes ativas', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/permissoes')
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
    });
  });

  describe('GET /permissoes/:id', () => {
    it('deve buscar permissao por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Permissao para Busca',
          chave: 'busca:teste',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/permissoes/${criado.body.id}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/permissoes/uuid-inexistente-12345')
        .expect(404);
    });
  });

  describe('PATCH /permissoes/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Permissao para Atualizar',
          chave: 'atualizar:original',
          descricao: 'Original',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/permissoes/${criado.body.id}`)
        .send({ nome: 'Nome Atualizado' })
        .expect(200);

      expect(resposta.body.nome).toBe('Nome Atualizado');
      expect(resposta.body.chave).toBe('atualizar:original');
    });
  });

  describe('DELETE /permissoes/:id', () => {
    it('deve fazer soft-delete de permissao', async () => {
      const criado = await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Permissao para Deletar',
          chave: 'deletar:teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/permissoes/${criado.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/permissoes/${criado.body.id}`)
        .expect(404);
    });
  });
});