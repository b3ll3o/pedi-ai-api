import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TestUser {
  email: string;
  senha: string;
  nome: string;
  perfilId?: string;
}

export async function getAuthToken(app: INestApplication, user: TestUser): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: user.email, senha: user.senha });

  if (response.status !== 200) {
    throw new Error(
      `Login failed with status ${response.status}: ${JSON.stringify(response.body)}`,
    );
  }

  return response.body.accessToken;
}

export async function createTestUser(
  app: INestApplication,
  email: string,
  senha: string,
  nome: string,
): Promise<TestUser> {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, senha, nome })
    .expect(201);

  return { email, senha, nome };
}

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}
