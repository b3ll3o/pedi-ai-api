---
name: security-checklist
description: Checklist de segurança OWASP + PediAI. Carregue quando persona `security-auditor` revisar código de auth, ou antes de release.
---

# Checklist de Segurança

## OWASP Top 10 (2021) — PediAI

### A01 — Broken Access Control

- [ ] Todo endpoint não-público com `JwtAuthGuard`
- [ ] Endpoints admin com `RolesAuthGuard` + `@RolesDecorators(Roles.ADMIN)`
- [ ] Endpoints autenticados: `GET /auth/me`, `POST /auth/logout`, `GET /auth/refresh`
- [ ] Endpoints públicos (4 apenas): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/register`, `GET /health`
- [ ] Verificação de role no use case (defense in depth), não só no controller
- [ ] CORS com `ALLOWED_ORIGINS` configurado (sem wildcard)
- [ ] Nenhum endpoint bypassa auth por erro de decorator

### A02 — Cryptographic Failures

- [ ] bcrypt com salt rounds ≥ 12
- [ ] JWT com `algorithms: ['HS256']` explícito (nunca `none`; defesa contra algorithm confusion)
- [ ] `JWT_SECRET` ≥ 256 bits, em env var (não no código)
- [ ] `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` ≤ 90 dias (cap enforced em `parseExpiresInSeconds`)
- [ ] HTTPS em produção
- [ ] Senha nunca em log, response, ou URL
- [ ] Senha nunca persistida em plain text
- [ ] Refresh token armazenado em `refresh_tokens.token` (JWT em texto claro — trade-off documentado em `.claude/skills/auth/SKILL.md` RNF-04)
- [ ] Senha em `.env.example` marcada como placeholder (não valor real)
- [ ] Login usa timing-equalization via `DUMMY_BCRYPT_HASH` (sempre roda bcrypt, ~100ms, mesmo para email inexistente)

### A03 — Injection

- [ ] Prisma por padrão (queries parametrizadas)
- [ ] Nenhum `prisma.$queryRaw` com string template ou concatenação
- [ ] Se usar `queryRaw`, usar `Prisma.sql\`...\`` (template tag)
- [ ] DTOs com `class-validator` em todos os endpoints
- [ ] `ValidationPipe` global com `whitelist: true`, `forbidNonWhitelisted: true`
- [ ] Campos extras rejeitados (não ignorados)
- [ ] Validação de CNPJ por dígitos verificadores (não só formato)
- [ ] Validação de email como RFC 5322
- [ ] Sem `eval` / `new Function` em qualquer lugar

### A04 — Insecure Design

- [ ] Spec de domínio com invariantes de segurança (RF explícito)
- [ ] Threat model atualizado por feature nova de auth/authz
- [ ] Limite de tentativas de login (rate limit)
- [ ] Mensagens de erro genéricas em auth (não revelar se email existe)

### A05 — Security Misconfiguration

- [ ] CORS allowlist restritivo (`ALLOWED_ORIGINS`)
- [ ] Sem `*` em CORS em prod
- [ ] Sem debug endpoints em prod (`/debug`, `/admin`)
- [ ] Sem stack trace em response de erro em prod
- [ ] Helmet ou similar (se aplicável)
- [ ] Variáveis de ambiente sensíveis documentadas em `.env.example` (sem valores)

### A06 — Vulnerable Components

- [ ] `npm audit` sem vulnerabilidades high/critical
- [ ] Dependências com maintenance ativo (último commit < 6 meses)
- [ ] Lockfile commitado (`package-lock.json`)
- [ ] Sem dependências com licença incompatível

### A07 — Auth Failures

- [ ] Rate limiting em `POST /auth/login` (5/60s default)
- [ ] Refresh token rotation implementado (com `generateRefreshTokenTransactional` para evitar race)
- [ ] Logout invalida refresh token **e** persiste o `jti` do access token em `revoked_jtis`
- [ ] `jwtService.verify()` é chamado **antes** de `tokenBlacklist.revoke()` (DoS protection — sem isso, tokens garbage poluem a blacklist)
- [ ] Blacklist persistente em Postgres (não em memória) — sobrevive a restart e é visível entre instâncias
- [ ] Cleanup periódico de `revoked_jtis` (a cada 5min) remove entradas expiradas
- [ ] Blacklist é fail-closed (erro de DB propaga, não silenciosamente aceita)
- [ ] Access token TTL ≤ 15 min
- [ ] Refresh token TTL ≤ 7 dias
- [ ] Tentativas falhas de login logadas (sem expor senha)
- [ ] Senha mínima de 8 caracteres
- [ ] Política de complexidade ou HIBP check
- [ ] Cada token inclui `jti` (necessário para revogação por logout)

### A08 — Software/Data Integrity

- [ ] Validar `alg` do JWT (nunca `none`) — `algorithms: ['HS256']` no `passport-jwt`
- [ ] Validar assinatura do JWT
- [ ] Validar `iss`, `aud`, `exp` quando aplicável
- [ ] `jti` presente no payload (necessário para blacklist)
- [ ] `proxy.ts` (no app) faz validação estrutural inline antes do backend (formato + `exp`)
- [ ] Sem deserialização de dados não-confiáveis
- [ ] Migrations Prisma revisadas antes de aplicar em prod

### A09 — Logging Failures

- [ ] Erros de auth logados (com timestamp, IP, userId)
- [ ] PII fora de logs (email pode estar; CPF nunca)
- [ ] Senha nunca em log
- [ ] Logs não expostos ao usuário final
- [ ] Nível de log apropriado (info, warn, error)
- [ ] Sem log de payload completo em prod

### A10 — SSRF

- [ ] Não aplicável (PediAI não faz fetch de URL arbitrária)
- [ ] Se vier a fazer, validar URL contra allowlist

## PediAI — Endpoints Públicos (whitelist)

Apenas 4 endpoints públicos (todos os outros exigem JWT):

1. `POST /auth/login` — login
2. `POST /auth/refresh` — refresh token
3. `POST /auth/register` — registro
4. `GET /health` — health check

## PediAI — Cookies (pedi-ai-app)

| Cookie | httpOnly | secure | sameSite | Por quê |
| --- | --- | --- | --- | --- |
| `pedi_auth_access_token` (proxy) | **true** | true (prod) | Lax | Lido server-side pelo proxy; cookie-only no client, defesa em profundidade |
| `pedi_auth_refresh_token` (server route) | **true** | true (prod) | Strict | Nunca exposto ao client; refresh acontece via server route `/api/auth/refresh` |
| localStorage `pedi_auth_access_token` | - | - | - | Mantido para uso client-side pelo AuthProvider (decisão consciente, documentada) |

**Atenção:** o `httpOnly: true` no cookie do access token é a configuração atual. O `proxy.ts` valida o JWT inline (formato + `exp`) antes de liberar render. Em outros contextos sem proxy, mantenha `httpOnly: true`.

## Checklist Pré-Deploy

- [ ] `npm audit` limpo
- [ ] Nenhum secret commitado
- [ ] `.env.example` atualizado
- [ ] CORS restritivo em prod
- [ ] HTTPS forçado
- [ ] Rate limit configurado
- [ ] Logs de auth habilitados
- [ ] Health check respondendo
- [ ] Senha de admin padrão rotacionada
- [ ] Migrations aplicadas

## Checklist Pós-Incidente

- [ ] Token de admin rotacionado
- [ ] Senhas afetadas invalidadas
- [ ] Logs de auditoria revisados
- [ ] CVE documentado em ADR
- [ ] Hotfix deployed
- [ ] Comunicação a usuários (se PII afetada)
