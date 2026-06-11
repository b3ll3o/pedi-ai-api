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
- [ ] JWT com `algorithm` explícito (nunca `none`)
- [ ] `JWT_SECRET` ≥ 256 bits, em env var (não no código)
- [ ] HTTPS em produção
- [ ] Senha nunca em log, response, ou URL
- [ ] Senha nunca persistida em plain text
- [ ] Refresh token armazenado hashed no banco
- [ ] Senha em `.env.example` marcada como placeholder (não valor real)

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
- [ ] Refresh token rotation implementado
- [ ] Logout invalida refresh token server-side
- [ ] Access token TTL ≤ 15 min
- [ ] Refresh token TTL ≤ 7 dias
- [ ] Tentativas falhas de login logadas (sem expor senha)
- [ ] Senha mínima de 8 caracteres
- [ ] Política de complexidade ou HIBP check

### A08 — Software/Data Integrity

- [ ] Validar `alg` do JWT (nunca `none`)
- [ ] Validar assinatura do JWT
- [ ] Validar `iss`, `aud`, `exp` quando aplicável
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
|--------|----------|--------|----------|---------|
| `pedi_auth_access_token` (proxy) | **false** | true (prod) | Lax | Lido server-side pelo proxy |
| localStorage tokens | - | - | - | Lido client-side pelo AuthProvider |

**Atenção:** `httpOnly: false` é **exceção documentada** por causa do proxy server-side. Em outros contextos, sempre `httpOnly: true`.

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
