import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env.e2e' });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Usuarios E2E', () => {
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

    // Limpar banco de dados antes dos testes E2E
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('deve criar usuario com dados validos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Usuario E2E',
          email: 'e2e@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      expect(resposta.body.nome).toBe('Usuario E2E');
      expect(resposta.body.email).toBe('e2e@exemplo.com');
      expect(resposta.body.senha).toBeUndefined();
      expect(resposta.body.id).toBeDefined();
    });

    it('deve retornar 409 para email duplicado', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Usuario Duplicado',
          email: 'duplicado@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Outro Usuario',
          email: 'duplicado@exemplo.com',
          senha: 'senha456',
        })
        .expect(409);
    });

    it('deve retornar 400 para dados invalidos', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Usuario Invalido',
          email: 'email-invalido',
          senha: '123',
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('deve listar todos os usuarios ativos', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
      resposta.body.forEach((usuario: any) => {
        expect(usuario.senha).toBeUndefined();
      });
    });
  });

  describe('GET /users/:id', () => {
    it('deve buscar usuario por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Usuario para Busca',
          email: 'busca@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/users/${criado.body.id}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
      expect(resposta.body.email).toBe('busca@exemplo.com');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/users/uuid-inexistente-12345')
        .expect(404);
    });
  });

  describe('GET /users/email/:email', () => {
    it('deve buscar usuario por email', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/users/email/e2e@exemplo.com')
        .expect(200);

      expect(resposta.body.email).toBe('e2e@exemplo.com');
      expect(resposta.body.senha).toBeUndefined();
    });

    it('deve retornar 404 para email inexistente', async () => {
      await request(app.getHttpServer())
        .get('/users/email/naoexiste@exemplo.com')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Usuario para Atualizar',
          email: 'atualizar@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/users/${criado.body.id}`)
        .send({ nome: 'Nome Atualizado' })
        .expect(200);

      expect(resposta.body.nome).toBe('Nome Atualizado');
      expect(resposta.body.email).toBe('atualizar@exemplo.com');
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve fazer soft-delete de usuario', async () => {
      const criado = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Usuario para Deletar',
          email: 'deletar@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${criado.body.id}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/users/${criado.body.id}`)
        .expect(404);
    });
  });
});