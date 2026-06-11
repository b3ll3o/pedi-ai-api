---
name: security-and-hardening
description: Protege código e endurece sistemas. Use ao implementar autenticação, autorização, manipulação de dados sensíveis, ou qualquer endpoint exposto. Use ao adicionar dependência externa. Use em revisão de segurança pré-deploy.
---

# Segurança e Hardening

## Visão Geral

Segurança não é feature — é propriedade. Adicionar autenticação é fácil; fazer corretamente é difícil. Esta skill implementa o baseline OWASP + checks específicos do PediAI para evitar as armadilhas mais comuns.

## Quando Usar

- Ao implementar login, signup, refresh de token
- Ao adicionar endpoint que recebe input do usuário
- Ao manipular dados sensíveis (senha, PII, token de pagamento)
- Ao adicionar dependência externa (`npm install`)
- Antes de fazer deploy
- Em revisão periódica (mensal)

## Top 10 OWASP + Checks PediAI

| # | Risco | Check PediAI |
|---|-------|--------------|
| 1 | **Broken Access Control** | `@RolesDecorators` + `RolesAuthGuard` em todo endpoint que não é público |
| 2 | **Cryptographic Failures** | bcrypt com salt rounds ≥ 12; JWT com algorithm explícito; HTTPS em prod |
| 3 | **Injection (SQL/NoSQL)** | Prisma por padrão; nunca `prisma.$queryRaw` com concatenação |
| 4 | **Insecure Design** | Spec de domínio com invariantes de segurança (RF explícito) |
| 5 | **Security Misconfiguration** | CORS allowlist restritivo; `ALLOWED_ORIGINS` em prod; sem debug em prod |
| 6 | **Vulnerable Components** | `npm audit` antes de cada release; dependências com maintenance ativo |
| 7 | **Auth Failures** | Rate limiting em login (`@nestjs/throttler`); refresh token rotation; logout server-side |
| 8 | **Software/Data Integrity** | Validar `alg` do JWT (nunca `alg: none`); validar assinatura |
| 9 | **Logging Failures** | Logar tentativas de auth falhadas; PII fora de logs |
| 10 | **SSRF** | Não aplicável (PediAI não faz fetch de URL arbitrária) |

## Checks Específicos do PediAI

### Autenticação (`auth`)

- [ ] bcrypt com salt rounds ≥ 12 (`src/domain/services/senha-hash.service.ts`)
- [ ] JWT com `algorithm` explícito (nunca `none`)
- [ ] `JWT_SECRET` ≥ 256 bits, em env var
- [ ] Access token TTL ≤ 15 min; refresh token TTL ≤ 7 dias
- [ ] Refresh token rotation implementado (novo a cada uso)
- [ ] Logout invalida refresh token server-side
- [ ] Rate limiting em `POST /auth/login` (5/60s default)
- [ ] Senha nunca logada ou retornada em response
- [ ] Senha nunca em URL ou query string

### Autorização (RBAC)

- [ ] `JwtAuthGuard` + `RolesAuthGuard` em todo endpoint não-público
- [ ] `@RolesDecorators(Roles.ADMIN)` em endpoints administrativos
- [ ] Verificação de role no use case (defense in depth), não só no controller
- [ ] `GET /auth/me` é o único endpoint autenticado sem role
- [ ] Endpoint público listado explicitamente em `pedi-ai-api/CLAUDE.md`

### Validação de Input

- [ ] DTOs com `class-validator` em todos os endpoints
- [ ] `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`
- [ ] Campos extras rejeitados (não ignorados silenciosamente)
- [ ] CNPJ validado por dígitos verificadores (não só formato)
- [ ] Email validado como RFC 5322
- [ ] Tamanho máximo de payload (DoS prevention)
- [ ] Unicode normalizado (prevenção de bypass)

### CORS & Cookies

- [ ] `ALLOWED_ORIGINS` configurado em prod (CSV, sem wildcard)
- [ ] Cookies com `httpOnly`, `secure`, `sameSite` (em prod)
- [ ] Cookie do proxy em pedi-ai-app com `httpOnly: false` é **exceção** documentada

### Banco de Dados (Prisma)

- [ ] Sem `prisma.$queryRaw` com concatenação de string
- [ ] Transações para operações multi-modelo
- [ ] Soft delete aplicado consistentemente
- [ ] Senhas nunca em seed (usar env ou geração)

### Logging

- [ ] Erros de auth logados com timestamp + IP
- [ ] PII fora de logs (email pode estar; senha nunca)
- [ ] Nível de log apropriado (info, warn, error)
- [ ] Logs não expostos ao usuário final

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "É só um MVP, segurança depois" | CVE em MVP vira breach em prod. Segurança desde o dia 1. |
| "JWT é seguro por padrão" | JWT mal configurado aceita `alg: none`, tokens sem expiração. Validar `algorithm` explicitamente. |
| "Está em HTTPS, então está seguro" | HTTPS protege trânsito. Dados persistidos podem ser vazados. |
| "CORS é chatice, vou liberar tudo" | CORS permissivo = outro site faz request com credenciais do usuário. |
| "Senha hashed com bcrypt já basta" | bcrypt com salt < 10 é quebrável. 12+ é o mínimo atual. |
| "Logout é remover cookie" | Sem invalidação server-side, token roubado vale até expirar. |
| "Não sou alvo, ninguém vai me atacar" | Bots não discriminam. Toda API pública é varrida. |

## Red Flags

- Endpoint sem `JwtAuthGuard` (exceto os explicitamente públicos)
- `bcrypt` com salt rounds < 10
- JWT sem `algorithm` explícito
- `CORS` com `*` ou array vazio em prod
- Senha em log, response, ou URL
- `prisma.$queryRaw` com string template
- Endpoint admin sem `@RolesDecorators`
- Falta de rate limit em `POST /auth/login`
- Dependência nova sem `npm audit`
- Mudança em auth sem teste E2E

## Verificação

- [ ] `npm audit` sem vulnerabilidades high/critical
- [ ] Todos os endpoints (exceto os 4 públicos documentados) com `JwtAuthGuard`
- [ ] Endpoints admin com `RolesAuthGuard` + `@RolesDecorators`
- [ ] bcrypt salt rounds ≥ 12
- [ ] JWT com `algorithm` explícito
- [ ] CORS com `ALLOWED_ORIGINS` restritivo em prod
- [ ] Senhas nunca em logs, responses, ou URLs
- [ ] Teste E2E cobre: login válido, login inválido, role insufficient, token expirado
- [ ] Cobertura ≥ 80% mantida
