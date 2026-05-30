import * as dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../.env.e2e') });

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, cleanupDatabase } from './helpers/app-setup';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais validas', async () => {
      const email = `usuario-login-${Date.now()}@exemplo.com`;

      await request(app.getHttpServer()).post('/users').send({
        nome: 'Usuario Login',
        email,
        senha: 'senha123',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'senha123' })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.expiresIn).toBe(900);
      expect(response.body.tokenType).toBe('Bearer');
    });

    it('deve retornar 401 com senha invalida', async () => {
      const email = `usuario-senha-errada-${Date.now()}@exemplo.com`;

      await request(app.getHttpServer()).post('/users').send({
        nome: 'Usuario Senha Errada',
        email,
        senha: 'senha123',
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'senhaerrada' })
        .expect(401);
    });

    it('deve retornar 401 para email inexistente', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'naoexiste@exemplo.com', senha: 'senha123' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('deve retornar 200 com token valido e dados do usuario', async () => {
      const email = `usuario-me-${Date.now()}@exemplo.com`;

      await request(app.getHttpServer()).post('/users').send({
        nome: 'Usuario Me',
        email,
        senha: 'senha123',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'senha123' });

      const { accessToken } = loginResponse.body;

      const meResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meResponse.body.email).toBe(email);
      expect(meResponse.body.senha).toBeUndefined();
    });
  });

  describe('POST /auth/refresh', () => {
    it('deve renovar token com refresh valido', async () => {
      const email = `usuario-refresh-${Date.now()}@exemplo.com`;

      await request(app.getHttpServer()).post('/users').send({
        nome: 'Usuario Refresh',
        email,
        senha: 'senha123',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, senha: 'senha123' });

      const { refreshToken } = loginResponse.body;

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.expiresIn).toBe(900);
      expect(refreshResponse.body.tokenType).toBe('Bearer');
    });

    it('deve retornar 401 com refresh token invalido', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'token-invalido' })
        .expect(401);
    });
  });
});
