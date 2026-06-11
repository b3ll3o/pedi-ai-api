---
name: ci-cd-and-automation
description: Configura integração contínua, deploy, e automações. Use ao criar/modificar pipeline, secrets, ou deploy. Use para diagnosticar falhas de CI.
---

# CI/CD e Automação

## Visão Geral

CI/CD transforma "funciona na minha máquina" em "funciona em prod" de forma reproduzível. PediAI usa GitHub Actions para CI, deploy manual via SSH para VPS, e Docker para os serviços de E2E. Esta skill documenta os pipelines e como modificá-los corretamente.

## Quando Usar

- Ao adicionar/modificar workflow em `.github/workflows/`
- Ao adicionar secret ou variável de ambiente
- Ao mudar processo de deploy
- Ao diagnosticar falha de CI
- Ao adicionar dependência que precisa ser cacheada
- Ao criar imagem Docker

## Pipeline de CI (PediAI)

**Arquivo:** `.github/workflows/api-ci-deploy.yml` (e equivalentes para `app`, `e2e`)

**Triggers:**
- Push em `main`
- Pull request para `main`
- `workflow_dispatch` (manual)

**Etapas (api):**
1. `npm ci` (instalação limpa)
2. `npx prisma generate`
3. `npm run lint`
4. `npx tsc --noEmit` (type-check)
5. `npm test` (unitários)
6. `npm run test:cov` (cobertura ≥ 80% enforced)
7. **Job `deploy`**: SSH na VPS, pull, build, restart systemd

**Concorrência:** `api-<ref>` com `cancel-in-progress: true` para evitar runs redundantes.

## Padrões de Workflow

### Cache de Dependências

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- run: npm ci
```

### Coverage Threshold

PediAI tem `coverageThreshold.global` em `jest.config.js` ou `package.json`:
- statements: 80%
- branches: 80%
- functions: 80%
- lines: 80%

**Se cair abaixo, CI falha.** Atualize o threshold conscientemente.

### Secrets

**Nunca em workflow, sempre em GitHub Secrets:**
- `JWT_SECRET`
- `DATABASE_URL` (production)
- `VPS_SSH_KEY`
- `VPS_HOST`

**Use `secrets.X` em `env:` ou `with:` — nunca `echo $SECRET` (vaza em logs).**

### Matrix (múltiplas versões Node)

```yaml
strategy:
  matrix:
    node-version: [20.x]
```

PediAI fixa em 20+. Não expandir sem motivo.

## Padrão de Deploy (PediAI)

1. CI passa em push na main
2. Job `deploy` dispara
3. SSH na VPS (via `appleboy/ssh-action` ou similar)
4. `git pull origin main`
5. `npm ci --production`
6. `npm run build`
7. `pm2 restart` ou `systemctl restart pedi-ai-api`
8. Health check (`GET /health`)

**Service file em** `deploy/pedi-ai-api.service`:
```ini
[Unit]
Description=PediAI API
After=network.target

[Service]
WorkingDirectory=/root/pedi-ai-api
ExecStart=/usr/bin/node dist/src/main.js
EnvironmentFile=/root/pedi-ai-api/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Docker (E2E)

PediAI usa `docker-compose` em `pedi-ai-e2e/` para orquestrar `postgres` + `api` + `app` em testes E2E.

**Cuidado:** o `Dockerfile` da API tem `prisma db push --force-reset` no entrypoint (apaga dados). É OK para E2E (banco descartável), **NUNCA use em produção**.

## Diagnosticando Falhas de CI

1. **Clique no job que falhou** para ver logs
2. **Identifique a etapa** (`lint`, `test`, `build`, `deploy`)
3. **Reproduza localmente** (`npm run lint && npm test && npm run build`)
4. **Para deploy:** cheque SSH, secrets, service status
5. **Para flaky tests:** rode a suite localmente 3x antes de commitar fix

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Pular CI pra ir mais rápido" | CI é a rede de segurança. Pular vira bug em prod. |
| "Threshold de coverage atrapalha" | Threshold garante qualidade mínima. Ajustar conscientemente. |
| "Secret em workflow é mais fácil" | Secret em workflow vaza em logs. GitHub Secrets é o caminho. |
| "Deploy manual é mais seguro" | Deploy manual sem script = passos esquecidos. Automatize o que é determinístico. |
| "Vou rodar `db push --force-reset` em prod" | Reset apaga dados. Use migration. |
| "Cache dá problema, vou desabilitar" | Cache acelera CI. Desabilitar custa tempo. Investigue o problema. |

## Red Flags

- Workflow sem cache de dependências
- Secret em texto claro no workflow
- Threshold de coverage abaixo de 80%
- Deploy sem health check
- `db push --force-reset` em workflow de produção
- Concorrência de CI não configurada (runs simultâneos)
- `npm install` em vez de `npm ci` (lock não respeitado)
- Testes flaky não marcados como tal

## Verificação

- [ ] CI passa em PR
- [ ] Coverage ≥ 80% enforced
- [ ] Secrets em GitHub Secrets (não em workflow)
- [ ] Deploy script testado em staging/manual
- [ ] Health check pós-deploy retorna 200
- [ ] Logs de CI não expõem secrets
- [ ] Concorrência configurada para evitar runs redundantes
- [ ] Workflow versionado (tag ou SHA de action externa)
