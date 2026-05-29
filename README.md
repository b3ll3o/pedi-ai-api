# pedi-ai-api

API REST do sistema PediAI - Cardápio Digital para Restaurantes.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** class-validator
- **API:** REST JSON
- **Auth:** JWT (Access + Refresh tokens)
- **Architecture:** DDD (Domain-Driven Design)

## Visão Geral

Sistema de cardápio digital com gerenciamento completo de restaurantes, usuários, perfis e permissões. Implementa autenticação JWT com RBAC (Role-Based Access Control).

## Comandos

```bash
npm run build          # Compila TypeScript
npm run start:dev     # Development (ts-node)
npm run start         # Production
npm test              # Jest unit tests
npm run test:e2e     # Jest E2E (config em test/jest-e2e.json)
npm run test:cov      # Cobertura
npm run lint          # ESLint + fix
```

## Domínios Implementados

| Domínio | Descrição | Pasta |
|---------|-----------|-------|
| `autenticacao` | Autenticação e autorização | `src/presentation/auth/` |
| `usuario` | Usuários do sistema | `src/application/usuarios/` |
| `perfil` | Perfis de usuário | `src/application/perfis/` |
| `permissao` | Permissões de acesso | `src/application/permissoes/` |
| `restaurante` | Restaurantes | `src/restaurante/` |

## Arquitetura DDD

```
src/
├── <dominio>/
│   ├── domain/                   # Regras de negócio
│   │   ├── entities/             # Entity classes
│   │   ├── value-objects/        # Value objects
│   │   ├── services/             # Domain services
│   │   └── repositories/         # Repository interfaces (ports)
│   ├── application/              # Casos de uso
│   │   ├── dto/                  # Data transfer objects
│   │   ├── use-cases/            # Application services
│   │   └── ports/                # Interface de entrada
│   ├── infrastructure/           # Implementações externas
│   │   └── persistence/          # Prisma repository implementations
│   └── presentation/             # Controllers REST
├── common/                       # Shared utilities
└── main.ts                       # Entry point
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login com email e senha |
| POST | `/auth/refresh` | Renovar access token |
| GET | `/auth/me` | Dados do usuário autenticado |

### Usuários (ADMIN)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/users` | Criar usuário |
| GET | `/users` | Listar usuários |
| GET | `/users/:id` | Buscar usuário por ID |
| PATCH | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Deletar usuário |

### Perfis (ADMIN)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/perfis` | Criar perfil |
| GET | `/perfis` | Listar perfis |
| GET | `/perfis/:id` | Buscar perfil por ID |
| PATCH | `/perfis/:id` | Atualizar perfil |
| DELETE | `/perfis/:id` | Deletar perfil |
| POST | `/perfis/:id/permissoes` | Associar permissão |
| DELETE | `/perfis/:id/permissoes/:permissaoId` | Desassociar permissão |

### Permissões (ADMIN)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/permissoes` | Criar permissão |
| GET | `/permissoes` | Listar permissões |
| GET | `/permissoes/:id` | Buscar permissão por ID |
| PATCH | `/permissoes/:id` | Atualizar permissão |
| DELETE | `/permissoes/:id` | Deletar permissão |

### Restaurantes (ADMIN)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/restaurants` | Criar restaurante |
| GET | `/restaurants` | Listar restaurantes |
| GET | `/restaurants/:id` | Buscar restaurante por ID |
| PATCH | `/restaurants/:id` | Atualizar restaurante |
| DELETE | `/restaurants/:id` | Soft delete restaurante |

## Autenticação e Autorização

### JWT

- **Access Token:** Expira em 15 minutos
- **Refresh Token:** Expira em 7 dias, armazenado no banco

### Roles (RBAC)

- `ADMIN` - Acesso completo (CRUD em todas entidades)
- `USUARIO` - Acesso básico (apenas `GET /auth/me`)

## Testes

```bash
# Unitários (217 testes, 98%+ cobertura)
npm test

# E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## OpenSpec-SDD

Este projeto segue a metodologia **OpenSpec / Specification-Driven Development**:

- Specs em `openspec/specs/<dominio>/spec.md`
- Changes em `openspec/changes/<feature>/`
- Workflow: draft → review → approved → implemented → archived

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:pass@host:5432/pedi_ai
JWT_SECRET=your-secret-key-min-256-bits
NODE_ENV=development
```

## Deploy

O deploy usa systemd service com Next.js standalone:

```ini
[Service]
ExecStart=/usr/bin/node .next/standalone/server.js
```