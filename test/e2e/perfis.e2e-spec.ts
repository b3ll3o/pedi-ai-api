import request from 'supertest';
import { setupTestApp } from './app.helper';

describe('Perfis E2E', () => {
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

  describe('POST /perfis', () => {
    it('deve criar perfil com dados validos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/perfis')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Perfil Duplicado',
          descricao: 'Teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/perfis')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
    });
  });

  describe('GET /perfis/:id', () => {
    it('deve buscar perfil por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/perfis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Perfil para Busca',
          descricao: 'Teste',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/perfis/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/perfis/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /perfis/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/perfis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Perfil para Atualizar',
          descricao: 'Original',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/perfis/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Perfil para Deletar',
          descricao: 'Teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/perfis/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/perfis/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /perfis/:id/permissoes', () => {
    it('deve associar permissoes ao perfil', async () => {
      const permissao = await request(app.getHttpServer())
        .post('/permissoes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Criar Usuario',
          chave: 'perfil:associar',
          descricao: 'Permite criar usuarios',
        })
        .expect(201);

      const perfil = await request(app.getHttpServer())
        .post('/perfis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Perfil com Permissao',
          descricao: 'Teste',
        })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .post(`/perfis/${perfil.body.id}/permissoes`)
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Listar Usuario',
          chave: 'perfil:desassociar',
          descricao: 'Permite listar usuarios',
        })
        .expect(201);

      const perfil = await request(app.getHttpServer())
        .post('/perfis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Perfil para Desassociar',
          descricao: 'Teste',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/perfis/${perfil.body.id}/permissoes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ permissoesIds: [permissao.body.id] })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/perfis/${perfil.body.id}/permissoes/${permissao.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
