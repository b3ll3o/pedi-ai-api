import request from 'supertest';
import { setupTestApp } from './app.helper';

describe('Permissoes E2E', () => {
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

  describe('POST /permissoes', () => {
    it('deve criar permissao com dados validos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Nome Duplicado',
          chave: 'teste:duplicado1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Nome Duplicado',
          chave: 'teste:duplicado2',
        })
        .expect(409);
    });

    it('deve retornar 409 para chave duplicada', async () => {
      await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Nome Diferente 1',
          chave: 'chave:unica1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Nome Diferente 2',
          chave: 'chave:unica1',
        })
        .expect(409);
    });

    it('deve retornar 400 para chave com formato invalido', async () => {
      await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
    });
  });

  describe('GET /permissoes/:id', () => {
    it('deve buscar permissao por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Permissao para Busca',
          chave: 'busca:teste',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/permissoes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/permissoes/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /permissoes/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Permissao para Atualizar',
          chave: 'atualizar:original',
          descricao: 'Original',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/permissoes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Permissao para Deletar',
          chave: 'deletar:teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/permissoes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/permissoes/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
