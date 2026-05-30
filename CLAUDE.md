# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in `pedi-ai-api`.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS + TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** class-validator
- **API:** REST JSON

---

## Comandos

```bash
npm run build          # Compila TypeScript
npm run start:dev     # Development (ts-node)
npm run start         # Production
npm test              # Jest unit tests
npm run test:e2e     # Jest E2E (config em test/jest-e2e.json)
npm run test:cov      # Cobertura
npm run lint          # ESLint
npm run lint:fix      # ESLint + auto-fix
npm run format        # Prettier format
```

---

## Arquitetura DDD (Domain-Driven Design)

Este projeto utiliza **Domain-Driven Design** com camadas bem definidas. Cada domínio (bounded context) possui sua própria estrutura.

### Estrutura por Domínio

```
src/
└── <dominio>/                    # Bounded Context (ex: autenticacao, cardapio, pedido)
    ├── domain/                   # Camada de domínio (regras de negócio)
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
    └── infrastructure/           # Implementações externas
        ├── persistence/          # Prisma repository implementations
        └── external/             # External services adapters
```

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

| Domínio | Descrição | Pasta |
|---------|-----------|-------|
| `autenticacao` | Autenticação e autorização | `src/presentation/auth/` |
| `usuario` | Usuários do sistema | `src/application/usuarios/` |
| `perfil` | Perfis de usuário | `src/application/perfis/` |
| `permissao` | Permissões de acesso | `src/application/permissoes/` |

---

## OpenSpec-SDD Workflow

### Classificação por Impacto

| Tipo       | Escopo                                | Artefatos necessários                                |
|------------|---------------------------------------|------------------------------------------------------|
| `minor`    | Bug fix, refactor interno             | spec.md atualizada                                   |
| `standard` | Nova feature, mudança moderada        | proposal + spec + tasks                              |
| `major`    | Mudança arquitetural, multi-domínio   | proposal + design + tasks + review formal            |

### Estados de Spec

| Estado     | Descrição                                                              |
|------------|-----------------------------------------------------------------------|
| `draft`    | Em elaboração                                                          |
| `review`   | Em revisão (stakeholders, team)                                        |
| `approved` | Aprovada, pronta para implementação                                     |
| `implemented` | Código shipped e testado                                         |
| `archived` | Movida para archive/ (não mais ativa)                                  |

### Fluxo Completo

```
1. Criar spec (draft) em openspec/specs/<dominio>/
2. Classificar (minor/standard/major)
3. Identificar domínio (bounded context)
4. Revisar (review → approved)
5. Implementar (DDD: entity, aggregate, service, repository)
6. Validar (testes, coverage 80%+)
7. Vincular (PR/commit → spec)
8. Arquivar (move to archive/YYYY-MM/)
```

### Regras Obrigatórias

1. **Spec first** — ANTES de escrever código, a especificação DEVE existir em `openspec/specs/`
2. **DDD** — TODO código DEVE seguir Domain-Driven Design (entities, aggregates, services, repositories)
3. **Classificação** — Toda spec DEVE ter tipo (minor/standard/major) e estado definido
4. **Proposta** — Mudanças `standard` e `major` DEVEM ter proposta em `openspec/changes/<feature>/proposal.md`
5. **Design** — Mudanças `major` DEVEM ter design documentado em `openspec/changes/<feature>/design.md`
6. **Tasks** — Implementação QUEBRADA em tarefas em `openspec/changes/<feature>/tasks.md`
7. **Idioma** — TODO código e documentação em **Português Brasileiro (pt-BR)**
8. **Testes** — Cobertura mínima 80%
9. **Aceitação** — Implementação SÓ pode começar APÓS spec ter estado `approved`
10. **Arquivamento** — Changes concluídas DEVEM ser movidas para `openspec/archive/<YYYY-MM>/` com `_summary.md`

### Checklist de Quality Gate

Para uma spec ser considerada válida (estado `approved`), DEVE conter:

- [ ] **Objetivo**: O que resolve, para quem
- [ ] **Domínio**: Bounded context identificado
- [ ] **Contexto**: Situação atual, problema
- [ ] **Modelo de Domínio**: Entidades, agregados, value objects, serviços definidos
- [ ] **Requisitos**: RF e RNF numerados (RF-01, RF-02...)
- [ ] **Critérios de aceitação**: Mensuráveis e testáveis
- [ ] **Decisões de design**: Links para design.md se aplicável
- [ ] **Estratégia de testes**: Como validar que está pronto
- [ ] **Tasks vinculadas**: tasks.md criada e linkada
- [ ] **Revisão aprovada**: Pelo menos 1 reviewer sign-off

### Template de Spec

```markdown
---
status: draft|review|approved|implemented|archived
type: minor|standard|major
domain: <bounded-context>
created: YYYY-MM-DD
updated: YYYY-MM-DD
linked_prs: [PR #...]
---

# <Nome da Spec>

## Domínio
<Bounded Context>

## Objetivo
O que resolve, para quem.

## Contexto
Situação atual, problema.

## Modelo de Domínio

### Entidades
- **Entidade1**: descrição, atributos principais
- **Entidade2**: descrição, atributos principais

### Agregados
- **Agregado1**: raiz, entidades pertencentes, invariantes

### Value Objects
- **ValueObject1**: descrição, atributos

### Serviços de Domínio
- **Servico1**: responsabilidade, regras

### Eventos de Domínio
- **Evento1**: quando ocorre, dados carregados

### Repositórios (Ports)
- **IRepositorio**: interface para persistência

## Requisitos Funcionais (RF)
- RF-01: ...
- RF-02: ...

## Requisitos Não-Funcionais (RNF)
- RNF-01: ...

## Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

## Decisões de Design
- [Design](design.md) - se aplicável

## Estratégia de Testes
- Unitários: ...
- E2E: ...

## Tasks
- [Tasks](tasks.md)
```

### Traceability

Commits e PRs DEVEM referenciar a spec que implementam:

```
commit: <hash>
spec: openspec/specs/<dominio>/spec.md
domain: <bounded-context>
```

No PR description:
```
## Spec
- Implementa: openspec/specs/<dominio>/spec.md
- Domínio: <bounded-context>
```

### Automação CI

```
- PR não pode ser mergeado se código muda domínio X
  sem que a spec correspondente tenha status "approved"
- Commits DEVEM referenciar spec (commit msg ou PR description)
- Coverage mínimo 80% enforced no CI
- Validação de tipos DDD (agregados, entidades, value objects)
```

### Estrutura OpenSpec

```
openspec/
├── config.yaml          # Configuração do projeto
├── specs/               # Especificações de domínio
│   └── <dominio>/
│       └── spec.md
└── changes/             # Propostas de mudança
    └── <feature>/
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/
└── archive/             # Changes concluídas (arquivadas por mês)
    └── <YYYY-MM>/
        └── _summary.md  # Liga specs e decisions principais
```

---

## Padrões de Código

### Entities
-命名: PascalCase, nome do domínio (ex: Usuario, ItemCardapio)
- Construtor com validação básica
- Métodos de domínio (comportamentos)
- Getters para propriedades

### Aggregates
-命名: PascalCase + Aggregate suffix (ex: PedidoAggregate)
- Raiz de agregação gerencia invariantes
- Métodos factory para criação
- Referência por ID (não por objeto)

### Value Objects
-命名: PascalCase (ex: Email, Dinheiro)
- Imutáveis (sem setters)
- equals() baseado em atributos

### Domain Services
-命名: PascalCase + Service suffix
- Sem estado (stateless)
- Coordenam múltiplos agregados/entities

### Repositories
-命名: I + Nome + Repository (ex: IUsuarioRepository)
- Interface definida no domain
- Implementação no infrastructure

### Application Services
-命名: PascalCase + UseCase ou ApplicationService suffix
- Orquestra fluxo de casos de uso
- Use case单个 (ex: CriarPedidoUseCase)
- Coordenam domain services e repositories

### DTOs
-命名: PascalCase + DTO suffix
- Apenas dados (sem comportamento)
- Validação com class-validator

---

## Testes

- **Cobertura mínima:** 80%
- **Testes unitários:** TODAS as entidades, agregados, serviços de domínio
- **Testes de integração:** Repositórios, serviços de aplicação
- **Testes E2E:** TODOS os fluxos da API DEVEM ter testes E2E
- Testes DEVEM ser escritos ANTES ou DURANTE a implementação
- Code review DEVE verificar conformidade com spec e DDD

---

## Camadas e Responsabilidades

| Camada | Responsabilidade | Não fazer |
|--------|-----------------|-----------|
| `domain` | Regras de negócio, modelo do domínio | Acesso a banco, HTTP |
| `application` | Casos de uso, orquestração | Regras de negócio diretas |
| `infrastructure` | Persistência, external services | Lógica de negócio |
| `presentation` | Controllers REST | Lógica de negócio |

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
// Exemplo em UsuariosController
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
export class UsuariosController {
  // Todos os endpoints requerem perfil ADMIN
}
```

**Decorators disponíveis:**

- `@RolesDecorators(...roles: Roles[])` - Especifica roles requeridos
- `ROLES_KEY` - Metadata key para roles

### Endpoints Protegidos por Role

| Método | Endpoint | Role Requerido |
|--------|----------|----------------|
| GET | /usuarios | ADMIN |
| POST | /usuarios | ADMIN |
| PATCH | /usuarios/:id | ADMIN |
| DELETE | /usuarios/:id | ADMIN |
| GET | /perfis | ADMIN |
| POST | /perfis | ADMIN |
| PATCH | /perfis/:id | ADMIN |
| DELETE | /perfis/:id | ADMIN |
| GET | /permissoes | ADMIN |
| POST | /permissoes | ADMIN |
| PATCH | /permissoes/:id | ADMIN |
| DELETE | /permissoes/:id | ADMIN |

**Endpoints públicos (sem proteção):**

- `POST /auth/login` - Autenticação
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Dados do usuário (requer JWT mas não role específico)
- `GET /health` - Health check

### Respostas de Erro

| Status | Descrição |
|--------|-----------|
| 401 | Não autenticado (token inválido ou ausente) |
| 403 | Autenticado mas sem permissão (perfil não ADMIN) |