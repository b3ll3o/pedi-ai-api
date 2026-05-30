import request from 'supertest';
import { setupTestApp } from './app.helper';

describe('Usuarios E2E', () => {
  let app: Awaited<ReturnType<typeof setupTestApp>>['app'];
  let authToken: string;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    authToken = setup.authToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('deve criar usuario com dados validos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Usuario Duplicado',
          email: 'duplicado@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Usuario para Busca',
          email: 'busca@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/users/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
      expect(resposta.body.email).toBe('busca@exemplo.com');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/users/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /users/email/:email', () => {
    it('deve buscar usuario por email', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/users/email/e2e@exemplo.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(resposta.body.email).toBe('e2e@exemplo.com');
      expect(resposta.body.senha).toBeUndefined();
    });

    it('deve retornar 404 para email inexistente', async () => {
      await request(app.getHttpServer())
        .get('/users/email/naoexiste@exemplo.com')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Usuario para Atualizar',
          email: 'atualizar@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/users/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Usuario para Deletar',
          email: 'deletar@exemplo.com',
          senha: 'senha123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/users/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/users/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
