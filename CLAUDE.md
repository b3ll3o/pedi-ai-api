# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in `pedi-ai-api`.

## Modo MVP (regra de operação — LEIA PRIMEIRO)

- **Simplicidade máxima** — preferir a solução mais simples que resolva. Adiar complexidade (agregados, domain services, events, design patterns elaborados) até que o problema concreto a exija.
- **Commits diretos na `main`** — sem PRs, sem feature branches, sem code review obrigatório. O time é pequeno e o objetivo é velocidade.
- **Skill-first ainda vale** — escrever/atualizar a SKILL.md do domínio antes de implementar, mas o ciclo é leve.

Essas regras vêm de decisão explícita do projeto (MVP). Sobrescrevem partes do workflow OpenSpec "puro" descrito abaixo quando houver conflito (ex: arquivamento pode ser postergado, formal review pode ser pulada).

---

## Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS 11 + TypeScript 5
- **ORM:** Prisma 7 (com `@prisma/adapter-pg` e `pg`)
- **Database:** PostgreSQL
- **Validação:** `class-validator` + `class-transformer`
- **Auth:** `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` (Access 15min + Refresh 7d)
- **Hash de senha:** `bcrypt` (`src/domain/services/senha-hash.service.ts`)
- **Health check:** `@nestjs/terminus` (`GET /health`)
- **API:** REST JSON
- **Testes:** Jest 29 + ts-jest + supertest
- **Lint/Format:** ESLint 8 + Prettier 3

**Porta padrão:** `3001` (override via `PORT`).

---

## Comandos

```bash
npm run build              # Compila TypeScript (tsc)
npm run start:dev          # Development (ts-node, watch não incluso)
npm run start              # Production (node dist/src/main.js)
npm run start:e2e-app      # Sobe API apontando para o banco e2e_app (usado pelos testes Playwright). IP do Postgres está hardcoded no package.json — para apontar para outro banco (ex: Postgres local), sobrescrever com `DATABASE_URL=... npm run start:e2e-app`.
npm test                   # Jest unit tests
npm test -- <arquivo>      # Roda um único teste (ex: npm test -- usuarios.service.spec)
npm test -- -t "<padrão>"  # Roda testes cujo nome bate com o padrão
npm run test:e2e           # Jest E2E (config em test/jest-e2e.json, --runInBand)
npm run test:cov           # Cobertura (mínimo 80% enforced no jest config)
npm run lint               # ESLint
npm run lint:fix           # ESLint + auto-fix
npm run format             # Prettier format
```

**Setup dos testes E2E (primeira vez):**
```bash
# 1. Garantir que o Postgres está rodando e acessível
# 2. Criar o banco `e2e_app` (uma vez):
docker exec -it <postgres-container> psql -U postgres -c "CREATE DATABASE e2e_app;"
# 3. Aplicar as migrations:
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/e2e_app?schema=public" npx prisma migrate deploy
# 4. Rodar os testes E2E:
npm run test:e2e
```

> O `.env.e2e` já vem configurado com `THROTTLE_SHORT_LIMIT=1000000` e `THROTTLE_LONG_LIMIT=10000000` para evitar 429 em testes paralelos.

**Prisma (após alterar `prisma/schema.prisma`):**
```bash
npx prisma generate              # Regenera o Prisma Client
npx prisma migrate dev --name X  # Dev: cria migration + aplica
npx prisma migrate deploy        # Prod-like: aplica migrations pendentes
npx prisma db push --force-reset # Sincroniza sem migration (usado pelo entrypoint do Docker e2e)
```

**Inspeção / debug:**
```bash
npx tsc --noEmit          # Type-check sem emitir
npx prisma studio         # GUI do banco (dev)
```

---

## Ambiente & Config

Env vars (ver `.env.example`):

| Var | Obrigatório | Descrição |
|-----|-------------|-----------|
| `PORT` | não | Porta HTTP (default `3000` em `main.ts`, mas produção usa `3001`) |
| `DATABASE_URL` | **sim** | Connection string PostgreSQL (`postgresql://user:pass@host:5432/db?schema=public`) |
| `JWT_SECRET` | **sim em prod** | Segredo JWT, mínimo 256 bits |
| `JWT_EXPIRES_IN` | não | TTL do access token (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | não | TTL do refresh token (default `7d`) |
| `ALLOWED_ORIGINS` | **sim em prod** | CSV de origens CORS permitidas |
| `THROTTLE_SHORT_LIMIT` | não | Limite do throttler na janela curta (60s). Default `5`. E2E usa `1000000` para evitar 429. |
| `THROTTLE_LONG_LIMIT` | não | Limite do throttler na janela longa (1h). Default `30`. E2E usa `10000000`. |

Arquivos de env no repo (cada um com propósito):
- `.env` — dev local
- `.env.example` — template versionado
- `.env.e2e` — testes E2E Jest (banco separado)
- `.env.e2e-app` — app E2E usado pelo Playwright (banco `e2e_app`)

**Pipes/filters globais** (em `main.ts`):
- `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` → campos extras em DTOs são rejeitados.
- `HttpExceptionFilter` global (`src/common/filters/`) → padroniza shape de erros.
- CORS habilitado apenas para origens em `ALLOWED_ORIGINS` (vazio = bloqueia tudo).

---

## Arquitetura DDD (Domain-Driven Design)

Este projeto utiliza **Domain-Driven Design** com camadas bem definidas. **Atenção:** a estrutura evoluiu ao longo do tempo — o código mais recente (ex: `restaurante`) é organizado **por domínio**, mas os domínios legados (`auth`, `usuarios`, `perfis`, `permissoes`) ainda são organizados **por camada técnica**.

### Estrutura por Domínio (target — usar em código novo)

```
src/
└── <dominio>/                    # Bounded Context (ex: restaurante, cardapio, pedido)
    ├── domain/                   # Regras de negócio
    │   ├── entities/             # Entity classes
    │   ├── aggregates/           # Aggregate roots
    │   ├── value-objects/        # Value objects
    │   ├── services/             # Domain services
    │   ├── events/               # Domain events
    │   └── repositories/         # Repository interfaces (ports)
    ├── application/              # Casos de uso
    │   ├── dto/                  # Data transfer objects
    │   ├── use-cases/            # Application services / use cases
    │   └── ports/                # Interface de entrada (controllers)
    ├── infrastructure/           # Implementações externas
    │   ├── persistence/          # Prisma repository implementations
    │   └── external/             # External services adapters
    └── presentation/             # Controllers REST
```

### Estrutura Atual (legado)

```
src/
├── application/         # auth/, usuarios/, perfis/, permissoes/ (use-cases)
├── presentation/        # auth/, usuarios/, perfis/, permissoes/ (controllers)
├── infrastructure/      # database/ (PrismaService, módulos)
├── common/              # filters/, health/ (shared)
├── domain/              # entities/, interfaces/, services/ (cross-cutting)
└── <dominio>/           # Apenas restaurante segue o padrão novo
```

**Ao criar um novo domínio:** seguir a estrutura por domínio. **Ao mexer em domínio legado:** seguir a estrutura atual dele (não migrar sem necessidade).

### Terminologia DDD

| Conceito | Descrição |
|----------|-----------|
| **Entity** | Objeto com identidade única que muda ao longo do tempo |
| **Aggregate** | Grupo de entidades tratadas como unidade com invariantes |
| **Value Object** | Objeto sem identidade, imutável, definido por seus atributos |
| **Domain Service** | Operação sem estado que pertence ao domínio |
| **Repository (Port)** | Interface para acesso a dados (persistência) |
| **Application Service** | Orquestra casos de uso, coordena fluxos |
| **Infrastructure (Adapter)** | Implementação concreta de portas |

### Domínios Identificados

| Domínio | Descrição | Localização | Estrutura |
|---------|-----------|-------------|-----------|
| `autenticacao` | Autenticação e autorização (JWT) | `src/presentation/auth/` + `src/application/auth/` | legada |
| `usuario` | Usuários do sistema | `src/presentation/usuarios/` + `src/application/usuarios/` | legada |
| `perfil` | Perfis de usuário | `src/presentation/perfis/` + `src/application/perfis/` | legada |
| `permissao` | Permissões de acesso | `src/presentation/permissoes/` + `src/application/permissoes/` | legada |
| `restaurante` | Restaurantes (CRUD + soft delete) | `src/restaurante/` | por-domínio (referência) |

---

## Agent-Skills + DDD Workflow

Este projeto usa o modelo de **agent-skills** (baseado em [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)) para workflows opinativos. Especificações de domínio vivem em `SKILL.md` por bounded context.

### Domínios (SKILL.md)

| Domínio | SKILL.md | Status |
|---------|----------|--------|
| `autenticacao` | `.claude/skills/auth/SKILL.md` | implemented |
| `restaurante` | `.claude/skills/restaurante/SKILL.md` | implemented |
| `perfil` | `.claude/skills/perfis/SKILL.md` | implemented |
| `permissao` | `.claude/skills/permissoes/SKILL.md` | implemented |

### Skills de Domínio (carregadas sob demanda)

Cada `SKILL.md` segue a estrutura:

1. **Visão Geral** — o que o domínio resolve
2. **Quando Usar** — triggers para ativar a skill
3. **Modelo de Domínio** — entidades, agregados, VOs, repositórios
4. **Requisitos Funcionais (RF)** e **Não-Funcionais (RNF)**
5. **Endpoints REST** (quando aplicável)
6. **Critérios de Aceitação** — mensuráveis e testáveis
7. **Racionalizações Comuns** — tabela anti-racionalização
8. **Red Flags** — sinais de que algo está errado
9. **Verificação** — checklist pré-merge

### Skills Base (workflows genéricos)

`.claude/skills/<skill>/SKILL.md` — disponíveis em todos os subprojetos:

- **Meta**: `using-agent-skills`
- **Define**: `spec-driven-development`, `idea-refine`, `interview-me`
- **Plan**: `planning-and-task-breakdown`
- **Build**: `incremental-implementation`, `test-driven-development`, `context-engineering`, `source-driven-development`, `doubt-driven-development`, `api-and-interface-design`
- **Verify**: `debugging-and-error-recovery`, `browser-testing-with-devtools`
- **Review**: `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization`
- **Ship**: `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `documentation-and-adrs`, `observability-and-instrumentation`, `shipping-and-launch`

### Personas (`.claude/agents/`)

- `code-reviewer.md` — revisão multi-eixo
- `test-engineer.md` — estratégia de testes + cobertura
- `security-auditor.md` — OWASP + PediAI
- `web-performance-auditor.md` — Core Web Vitals

### Slash Commands (`.claude/commands/`)

| Comando | Ativa |
|---------|-------|
| `/spec` | `spec-driven-development`, `idea-refine` |
| `/plan` | `planning-and-task-breakdown` |
| `/build` | `incremental-implementation`, `test-driven-development` |
| `/test` | `test-driven-development`, `browser-testing-with-devtools` |
| `/review` | persona `code-reviewer` + `code-review-and-quality` |
| `/code-simplify` | `code-simplification` |
| `/ship` | personas `code-reviewer` + `security-auditor` + `test-engineer` em paralelo |

### References (`.claude/references/`)

- `testing-patterns.md` — pirâmide de testes, TDD, anti-patterns
- `security-checklist.md` — OWASP, RBAC, secrets
- `performance-checklist.md` — Core Web Vitals, N+1, paginação
- `accessibility-checklist.md` — WCAG 2.1 AA (carrega em app; também em api para respostas JSON acessíveis)

### Regras Obrigatórias

1. **Skill first** — ANTES de escrever código, a SKILL.md do domínio DEVE existir em `.claude/skills/<dominio>/SKILL.md`
2. **DDD** — TODO código DEVE seguir Domain-Driven Design (entities, aggregates, services, repositories)
3. **Idioma** — TODO código e documentação em **Português Brasileiro (pt-BR)**
4. **Testes** — Cobertura mínima 80%
5. **Quality Gate** — SKILL.md DEVE conter Visão Geral, Quando Usar, RF/RNF, Critérios de Aceitação, Racionalizações, Red Flags, Verificação

### Template de SKILL.md de Domínio

```markdown
---
name: <dominio-kebab-case>
description: <PT-BR — descreve o domínio e quando ativar a skill>
type: domain
status: draft|implemented
domain: <bounded-context>
---

# <Nome do Domínio>

## Visão Geral
O que resolve, para quem.

## Quando Usar
- Trigger 1
- Trigger 2

## Modelo de Domínio
### Entidades / Agregados / Value Objects / Repositórios

## Requisitos Funcionais (RF)
- RF-01: ...
- RF-02: ...

## Requisitos Não-Funcionais (RNF)
- RNF-01: ...

## Critérios de Aceitação
- [ ] ...

## Racionalizações Comuns
| Racionalização | Realidade |
|---|---|
| "..." | ... |

## Red Flags
- ...

## Verificação
- [ ] `npm run lint` sem erros
- [ ] `npm run test:cov` ≥ 80%
- [ ] ...
```

### Traceability

Commits DEVEM referenciar a skill de domínio:

```
commit: <hash>
skill: .claude/skills/<dominio>/SKILL.md
domain: <bounded-context>
```

### Histórico OpenSpec (migrado)

O workflow anterior (OpenSpec-SDD) está preservado na tag git `pre-agent-skills-migration`. 12 specs + 6 changes arquivadas ficam acessíveis via:

```bash
git checkout pre-agent-skills-migration -- openspec/  # restaura estrutura antiga
git log --oneline -- openspec/                          # vê histórico de mudanças
```

---

## Padrões de Código

### Entities
- **Nomenclatura:** PascalCase, nome do domínio (ex: `Usuario`, `ItemCardapio`)
- Construtor com validação básica
- Métodos de domínio (comportamentos)
- Getters para propriedades

### Aggregates
- **Nomenclatura:** PascalCase + sufixo `Aggregate` (ex: `PedidoAggregate`)
- Raiz de agregação gerencia invariantes
- Métodos factory para criação
- Referência por ID (não por objeto)

### Value Objects
- **Nomenclatura:** PascalCase (ex: `Email`, `Dinheiro`)
- Imutáveis (sem setters)
- `equals()` baseado em atributos

### Domain Services
- **Nomenclatura:** PascalCase + sufixo `Service`
- Sem estado (stateless)
- Coordenam múltiplos agregados/entities

### Repositories
- **Nomenclatura:** `I` + Nome + `Repository` (ex: `IUsuarioRepository`)
- Interface definida no `domain`
- Implementação no `infrastructure`

### Application Services
- **Nomenclatura:** PascalCase + sufixo `UseCase` ou `ApplicationService`
- Orquestra fluxo de casos de uso
- Um caso de uso por classe (ex: `CriarPedidoUseCase`)
- Coordenam domain services e repositories

### DTOs
- **Nomenclatura:** PascalCase + sufixo `DTO`
- Apenas dados (sem comportamento)
- Validação com `class-validator`

---

## Testes

- **Cobertura mínima:** 80% — **enforced no `jest.config.coverageThreshold.global`** do `package.json` (statements/branches/functions/lines). CI falha se cair.
- **Excluídos da cobertura:** `*.module.ts`, `index.ts`, `*.entity.ts`, `main.ts`, `app.module.ts`, `presentation/auth/guards/**`.
- **Testes unitários:** TODAS as entidades, agregados, serviços de domínio
- **Testes de integração:** Repositórios, serviços de aplicação
- **Testes E2E:** TODOS os fluxos da API DEVEM ter testes E2E (config em `test/jest-e2e.json`, setup em `test/jest-e2e-setup.ts`, rodam com `--runInBand`)
- Testes DEVEM ser escritos ANTES ou DURANTE a implementação
- Code review DEVE verificar conformidade com spec e DDD

**Pattern para rodar um teste só:**
```bash
npm test -- test/perfis-servico.spec.ts
npm test -- -t "deve criar restaurante"
```

---

## Camadas e Responsabilidades

| Camada | Responsabilidade | Não fazer |
|--------|-----------------|-----------|
| `domain` | Regras de negócio, modelo do domínio | Acesso a banco, HTTP |
| `application` | Casos de uso, orquestração | Regras de negócio diretas |
| `infrastructure` | Persistência (Prisma), external services | Lógica de negócio |
| `presentation` | Controllers REST, DTOs de entrada, decorators | Lógica de negócio |

**Onde fica o que** (mapa prático):
- `src/infrastructure/database/prisma/` → `PrismaService` + repositórios concretos (um por aggregate)
- `src/infrastructure/database/prisma/repositories/` → implementações que estendem as interfaces do `domain/`
- `src/common/filters/` → exception filters globais
- `src/common/health/` → controller do `/health` (Terminus)
- `src/domain/entities/`, `interfaces/`, `services/` → cross-cutting (ex: `senha-hash.service.ts` para bcrypt)

---

## RBAC - Controle de Acesso Baseado em Perfis

O sistema implementa **Role-Based Access Control (RBAC)** onde apenas usuários com perfil `ADMIN` podem gerenciar usuários, perfis e permissões.

### Perfis Existentes

| Perfil | Descrição |
|--------|-----------|
| `ADMIN` | Acesso completo a todas as funcionalidades de gerenciamento |
| `USUARIO` | Acesso básico - apenas leitura do próprio perfil via `GET /auth/me` |

### RolesGuard

O `RolesAuthGuard` verifica se o usuário autenticado possui o perfil necessário para acessar endpoints protegidos.

**Localização:** `src/presentation/auth/guards/roles-auth.guard.ts`

**Uso nos Controllers:**

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
export class UsuariosController {
  // Todos os endpoints requerem perfil ADMIN
}
```

**Decorators disponíveis:**

- `@RolesDecorators(...roles: Roles[])` - Especifica roles requeridos
- `@CurrentUser()` - Extrai o usuário autenticado do request (em `decorators/current-user.decorator.ts`)
- `ROLES_KEY` - Metadata key para roles

### Endpoints Protegidos por Role

| Método | Endpoint | Role Requerido |
|--------|----------|----------------|
| GET/POST | /users | ADMIN |
| PATCH/DELETE | /users/:id | ADMIN |
| GET/POST | /perfis | ADMIN |
| PATCH/DELETE | /perfis/:id | ADMIN |
| POST | /perfis/:id/permissoes | ADMIN |
| DELETE | /perfis/:id/permissoes/:permissaoId | ADMIN |
| GET/POST | /permissoes | ADMIN |
| PATCH/DELETE | /permissoes/:id | ADMIN |
| GET/POST | /restaurants | ADMIN |
| PATCH/DELETE | /restaurants/:id | ADMIN |

> Nota: rotas de usuário estão expostas em inglês (`/users`), enquanto perfis e permissões ficaram em português (`/perfis`, `/permissoes`). É assim no código, não mexer sem combinar.

**Endpoints públicos (sem proteção):**

- `POST /auth/login` - Login (retorna access + refresh)
- `POST /auth/refresh` - Renovar access token usando refresh token
- `POST /auth/register` - Registro de usuário (sem auth)
- `GET /health` - Health check (NestJS Terminus)

**Endpoints autenticados (JWT obrigatório, sem role):**

- `POST /auth/logout` - Invalida refresh token no banco
- `GET /auth/me` - Dados do usuário logado (inclui perfil.nome)

### Respostas de Erro

| Status | Descrição |
|--------|-----------|
| 401 | Não autenticado (token inválido ou ausente) |
| 403 | Autenticado mas sem permissão (perfil não ADMIN) |
| 400 | Validação falhou (ValidationPipe rejeitou campos extras ou inválidos) |

---

## Modelo de Dados

Schema em `prisma/schema.prisma`. Padrões transversais aplicados a quase todas as entidades:

- **Snake_case em colunas** via `@map("...")` (`created_at`, `updated_at`, `deleted_at`, `perfil_id`).
- **Soft delete** via `deletedAt DateTime?` — `null` = ativo; repositórios filtram `deletedAt: null` por padrão.
- **Versionamento otimista** via `version Int @default(1)` — incrementa a cada update.
- **Timestamps** com `@default(now())` e `@updatedAt`.

Entidades atuais:

| Model | Tabela | Notas |
|-------|--------|-------|
| `User` | `users` | FK opcional `perfilId` → `perfis.id`; tem `refreshTokens` |
| `Perfil` | `perfis` | N:N com `Permissao` via tabela implícita |
| `Permissao` | `permissoes` | Unique em `nome` e `chave` |
| `RefreshToken` | (ver schema) | Tokens persistidos para revogação no logout |
| `Restaurante` | (ver schema) | CRUD + soft delete |

**Prisma Client** é gerado em `node_modules/@prisma/client`. Repository implementations ficam em `src/infrastructure/database/prisma/repositories/`.

---

## CI/CD & Deploy

### CI (`.github/workflows/api-ci-deploy.yml`)

Dispara em push/PR para `main` e via `workflow_dispatch`. **Concorrência:** `api-<ref>` com cancel-in-progress.

Pipeline de CI:
1. `npm ci`
2. `npx prisma generate`
3. `npm run lint`
4. `npx tsc --noEmit` (type-check)
5. `npm test` (unitários)
6. `npm run test:cov` (verifica threshold 80%)

### Deploy

Push em `main` (e CI passando) dispara job `deploy` que faz SSH em uma VPS e roda o build lá. O serviço roda como **systemd unit** (`deploy/pedi-ai-api.service`):

- `WorkingDirectory=/root/pedi-ai-api`
- `ExecStart=/usr/bin/node dist/main.js`
- `EnvironmentFile=/root/pedi-ai-api/.env`
- `Restart=always` (5s)

### Docker

`Dockerfile` é **multi-stage** (deps → build → runner), usa `node:20-alpine`, expõe `3001` e roda `entrypoint.sh` que:
1. Aguarda `postgres:5432` via `nc -z`
2. Aplica schema com `prisma db push --force-reset --url "$DATABASE_URL"` (apaga dados!)
3. Roda seed (`node dist/prisma/seed-e2e.js`)
4. Inicia a app com `node dist/src/main.js`

**Atenção:** o `entrypoint.sh` foi feito para o container de E2E — em produção real o schema é gerenciado por migrations, não por `db push`.

### Validação de push

`scripts/validate-push.sh` é um helper local que valida o estado antes de push (lint + type-check + tests).