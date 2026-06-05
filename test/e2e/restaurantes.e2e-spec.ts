import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestApp } from './app.helper';

/**
 * Helper: gera um CNPJ único (formato XX.XXX.XXX/XXXX-XX) e válido.
 * Usa timestamp + contador para evitar colisão entre testes.
 */
let cnpjCounter = 0;
const calcCnpjDV = (digits: string): number => {
  // Pesos oficiais: DV1 usa 5..2 e DV2 usa 6..2
  const weights =
    digits.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = digits
    .split('')
    .reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
};
const buildValidCnpj = (): string => {
  cnpjCounter += 1;
  const base = String(Date.now() + cnpjCounter).padStart(12, '0').slice(-12);
  const dv1 = calcCnpjDV(base);
  const dv2 = calcCnpjDV(base + String(dv1));
  const full = `${base}${dv1}${dv2}`;
  return `${full.slice(0, 2)}.${full.slice(2, 5)}.${full.slice(5, 8)}/${full.slice(8, 12)}-${full.slice(12, 14)}`;
};

const buildRestauranteValido = (overrides: Record<string, unknown> = {}) => ({
  nome: 'Restaurante Teste',
  cnpj: buildValidCnpj(),
  endereco: 'Rua Teste, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01310-100',
  horarioAbertura: '10:00',
  horarioFechamento: '22:00',
  ...overrides,
});

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

  describe('POST /restaurants', () => {
    it('deve criar restaurante com dados válidos', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(
          buildRestauranteValido({
            nome: 'Restaurante Teste',
            email: 'contato@restaurante.com',
            telefone: '(11) 99999-9999',
          }),
        )
        .expect(201);

      expect(resposta.body.nome).toBe('Restaurante Teste');
      expect(resposta.body.id).toBeDefined();
    });

    it('deve criar restaurante com apenas campos obrigatórios', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ nome: 'Restaurante Minimalista' }))
        .expect(201);

      expect(resposta.body.nome).toBe('Restaurante Minimalista');
    });

    it('deve retornar 400 para nome vazio', async () => {
      await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ nome: '' }))
        .expect(400);
    });

    it('deve retornar 400 para email invalido', async () => {
      await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ email: 'email-invalido' }))
        .expect(400);
    });
  });

  describe('GET /restaurants', () => {
    it('deve listar todos os restaurantes ativos', async () => {
      await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ nome: 'Restaurante para Listagem' }))
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(resposta.body)).toBe(true);
      expect(resposta.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /restaurants/:id', () => {
    it('deve buscar restaurante por ID', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ nome: 'Restaurante para Busca' }))
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get(`/restaurants/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(resposta.body.id).toBe(criado.body.id);
      expect(resposta.body.nome).toBe('Restaurante para Busca');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/restaurants/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /restaurants/:id', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ nome: 'Restaurante para Atualizar' }))
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/restaurants/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: 'Nome Atualizado' })
        .expect(200);

      expect(resposta.body.nome).toBe('Nome Atualizado');
    });

    it('deve atualizar multiplos campos', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(
          buildRestauranteValido({
            nome: 'Restaurante Multicampos',
            telefone: '(11) 1111-1111',
          }),
        )
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .patch(`/restaurants/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          telefone: '(11) 2222-2222',
          endereco: 'Novo endereco',
        })
        .expect(200);

      expect(resposta.body.endereco).toBe('Novo endereco');
      expect(resposta.body.telefone).toBe('(11) 2222-2222');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .patch('/restaurants/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nome: 'Novo Nome' })
        .expect(404);
    });
  });

  describe('DELETE /restaurants/:id', () => {
    it('deve fazer soft-delete de restaurante', async () => {
      const criado = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildRestauranteValido({ nome: 'Restaurante para Deletar' }))
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/restaurants/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/restaurants/${criado.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .delete('/restaurants/uuid-inexistente-12345')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Acesso não autorizado', () => {
    it('deve retornar 401 para requisição sem token', async () => {
      await request(app.getHttpServer()).get('/restaurants').expect(401);
    });

    it('deve retornar 401 para token invalido', async () => {
      await request(app.getHttpServer())
        .get('/restaurants')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);
    });
  });
});
