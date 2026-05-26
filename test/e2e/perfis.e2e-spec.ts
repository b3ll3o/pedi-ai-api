import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env.e2e' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Perfis E2E', () => {
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
    // Limpar usuarios primeiro (quebrando relacao com perfis)
    await prisma.user.deleteMany({});
    // Deletar relacionamentos via perfis ( junction table)
    await prisma.perfil.updateMany({
      data: { deletedAt: new Date() }
    });
    await prisma.permissao.updateMany({
      data: { deletedAt: new Date() }
    });
    // Deletar perfis e permissoes (cascade deve limpar junction)
    await prisma.perfil.deleteMany({});
    await prisma.permissao.deleteMany({});
    // Garantir que permissoes estao limpas
    await prisma.permissao.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /perfis', () => {
    it('deve criar perfil com dados validos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil Admin',
          descricao: 'Perfil de administrador',
        })
        .expect(201);

      expect(resposta.body.nome).toBe('Perfil Admin');
      expect(resposta.body.id).toBeDefined();
    });

    it('deve retornar 409 para nome duplicado', async () => {
      await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil Duplicado',
          descricao: 'Teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil Duplicado',
          descricao: 'Outro',
        })
        .expect(409);
    });
  });

  describe('GET /perfis', () => {
    it('deve listar todos os perfis ativos', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/perfis')
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
    });
  });

  describe('GET /perfis/:id', () => {
    it('deve buscar perfil por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil para Busca',
          descricao: 'Teste',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/perfis/${criado.body.id}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/perfis/uuid-inexistente-12345')
        .expect(404);
    });
  });

  describe('PATCH /perfis/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil para Atualizar',
          descricao: 'Original',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/perfis/${criado.body.id}`)
        .send({ nome: 'Nome Atualizado' })
        .expect(200);

      expect(resposta.body.nome).toBe('Nome Atualizado');
      expect(resposta.body.descricao).toBe('Original');
    });
  });

  describe('DELETE /perfis/:id', () => {
    it('deve fazer soft-delete de perfil', async () => {
      const criado = await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil para Deletar',
          descricao: 'Teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/perfis/${criado.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/perfis/${criado.body.id}`)
        .expect(404);
    });
  });

  describe('POST /perfis/:id/permissoes', () => {
    it('deve associar permissoes ao perfil', async () => {
      const permissao = await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Criar Usuario',
          chave: 'perfil:associar',
          descricao: 'Permite criar usuarios',
        })
        .expect(201);

      const perfil = await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil com Permissao',
          descricao: 'Teste',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .post(`/perfis/${perfil.body.id}/permissoes`)
        .send({ permissoesIds: [permissao.body.id] })
        .expect(201);

      expect(resposta.body.permissoes).toBeDefined();
      expect(resposta.body.permissoes.length).toBe(1);
    });
  });

  describe('DELETE /perfis/:id/permissoes/:permissaoId', () => {
    it('deve desassociar permissao do perfil', async () => {
      const permissao = await request(app.getHttpServer())
        .post('/permissoes')
        .send({
          nome: 'Listar Usuario',
          chave: 'perfil:desassociar',
          descricao: 'Permite listar usuarios',
        })
        .expect(201);

      const perfil = await request(app.getHttpServer())
        .post('/perfis')
        .send({
          nome: 'Perfil para Desassociar',
          descricao: 'Teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/perfis/${perfil.body.id}/permissoes`)
        .send({ permissoesIds: [permissao.body.id] })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/perfis/${perfil.body.id}/permissoes/${permissao.body.id}`)
        .expect(204);
    });
  });
});