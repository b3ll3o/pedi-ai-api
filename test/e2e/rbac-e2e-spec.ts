import * as dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../../.env.e2e') });

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, cleanupDatabase } from './helpers/app-setup';
import { loginAdmin, loginUsuario, getAuthHeaders } from './helpers/auth-helpers';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';

describe('RBAC E2E', () => {
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

  describe('Usuarios - Protegido por RBAC', () => {
    it('admin_deve_acessar_GET_users', async () => {
      const { token } = await loginAdmin(app, prisma);

      await request(app.getHttpServer())
        .get('/users')
        .set(getAuthHeaders(token.accessToken))
        .expect(200);
    });

    it('usuario_deve_receber_403_em_GET_users', async () => {
      const { token } = await loginUsuario(app, prisma);

      await request(app.getHttpServer())
        .get('/users')
        .set(getAuthHeaders(token.accessToken))
        .expect(403);
    });
  });

  describe('Perfis - Protegido por RBAC', () => {
    it('admin_deve_acessar_GET_perfis', async () => {
      const { token } = await loginAdmin(app, prisma);

      await request(app.getHttpServer())
        .get('/perfis')
        .set(getAuthHeaders(token.accessToken))
        .expect(200);
    });

    it('usuario_deve_receber_403_em_GET_perfis', async () => {
      const { token } = await loginUsuario(app, prisma);

      await request(app.getHttpServer())
        .get('/perfis')
        .set(getAuthHeaders(token.accessToken))
        .expect(403);
    });
  });

  describe('Permissoes - Protegido por RBAC', () => {
    it('admin_deve_acessar_GET_permissoes', async () => {
      const { token } = await loginAdmin(app, prisma);

      await request(app.getHttpServer())
        .get('/permissoes')
        .set(getAuthHeaders(token.accessToken))
        .expect(200);
    });

    it('usuario_deve_receber_403_em_GET_permissoes', async () => {
      const { token } = await loginUsuario(app, prisma);

      await request(app.getHttpServer())
        .get('/permissoes')
        .set(getAuthHeaders(token.accessToken))
        .expect(403);
    });
  });

  describe('Restaurants - Protegido por RBAC', () => {
    it('admin_deve_acessar_crud_restaurants', async () => {
      const { token } = await loginAdmin(app, prisma);
      const headers = getAuthHeaders(token.accessToken);

      const created = await request(app.getHttpServer())
        .post('/restaurants')
        .set(headers)
        .send({
          nome: 'Restaurante Admin',
          cnpj: '45.381.763/0001-68',
          endereco: 'Rua Teste',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '12345-678',
          horarioAbertura: '09:00',
          horarioFechamento: '22:00',
        })
        .expect(201);

      expect(created.body.id).toBeDefined();

      await request(app.getHttpServer()).get('/restaurants').set(headers).expect(200);

      await request(app.getHttpServer())
        .get(`/restaurants/${created.body.id}`)
        .set(headers)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/restaurants/${created.body.id}`)
        .set(headers)
        .send({ nome: 'Restaurante Atualizado' })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/restaurants/${created.body.id}`)
        .set(headers)
        .expect(204);
    });

    it('usuario_deve_receber_403_em_restaurants', async () => {
      const { token } = await loginUsuario(app, prisma);

      await request(app.getHttpServer())
        .get('/restaurants')
        .set(getAuthHeaders(token.accessToken))
        .expect(403);
    });
  });
});
