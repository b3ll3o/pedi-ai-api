import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestApp, TestSetup } from './app.helper';

describe('Restaurantes E2E', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    authToken = setup.authToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /restaurantes', () => {
    it('deve criar restaurante com dados válidos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante Teste',
          descricao: 'Um restaurante para testes',
          endereco: 'Rua Teste, 123',
          telefone: '(11) 99999-9999',
          email: 'contato@restaurante.com',
        })
        .expect(201);

      expect(resposta.body.nome).toBe('Restaurante Teste');
      expect(resposta.body.id).toBeDefined();
    });

    it('deve criar restaurante com apenas campos obrigatórios', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante Minimalista',
        })
        .expect(201);

      expect(resposta.body.nome).toBe('Restaurante Minimalista');
    });

    it('deve retornar 400 para nome vazio', async () => {
      await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: '',
        })
        .expect(400);
    });

    it('deve retornar 400 para email invalido', async () => {
      await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante Teste',
          email: 'email-invalido',
        })
        .expect(400);
    });
  });

  describe('GET /restaurantes', () => {
    it('deve listar todos os restaurantes ativos', async () => {
      await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante para Listagem',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
      expect(resposta.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /restaurantes/:id', () => {
    it('deve buscar restaurante por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante para Busca',
          descricao: 'Teste de busca',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/restaurantes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
      expect(resposta.body.nome).toBe('Restaurante para Busca');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/restaurantes/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /restaurantes/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante para Atualizar',
          descricao: 'Original',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/restaurantes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: 'Nome Atualizado' })
        .expect(200);

      expect(resposta.body.nome).toBe('Nome Atualizado');
      expect(resposta.body.descricao).toBe('Original');
    });

    it('deve atualizar multiplos campos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante Multicampos',
          telefone: '(11) 1111-1111',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/restaurantes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          descricao: 'Descricao atualizada',
          endereco: 'Novo endereco',
        })
        .expect(200);

      expect(resposta.body.descricao).toBe('Descricao atualizada');
      expect(resposta.body.endereco).toBe('Novo endereco');
      expect(resposta.body.telefone).toBe('(11) 1111-1111');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .patch('/restaurantes/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: 'Novo Nome' })
        .expect(404);
    });
  });

  describe('DELETE /restaurantes/:id', () => {
    it('deve fazer soft-delete de restaurante', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurantes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Restaurante para Deletar',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/restaurantes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/restaurantes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .delete('/restaurantes/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Acesso não autorizado', () => {
    it('deve retornar 401 para requisição sem token', async () => {
      await request(app.getHttpServer()).get('/restaurantes').expect(401);
    });

    it('deve retornar 401 para token invalido', async () => {
      await request(app.getHttpServer())
        .get('/restaurantes')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);
    });
  });
});
