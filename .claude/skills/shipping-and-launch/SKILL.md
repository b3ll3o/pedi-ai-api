---
name: shipping-and-launch
description: Lança releases em produção de forma segura. Use ao fazer release, ao criar tag, ou ao coordenar deploy. Use para rollback e comunicação.
---

# Shipping e Launch

## Visão Geral

Ship ≠ commit. Shipping envolve: validação final, versionamento, deploy, monitoramento, e rollback se necessário. Esta skill guia o processo de release do PediAI com gates de qualidade obrigatórios.

## Quando Usar

- Antes de cada release em produção
- Ao criar tag de release
- Ao coordenar deploy
- Ao fazer rollback
- Ao comunicar release para stakeholders

## Pré-requisitos: Checklist de Ship

Antes de commitar uma release, TODOS esses itens devem estar ✅:

- [ ] Todos os RFs e RNFs da spec estão implementados
- [ ] Todos os Critérios de Aceitação da spec estão marcados
- [ ] Cobertura de testes ≥ 80% (`npm run test:cov`)
- [ ] Lint passa (`npm run lint`)
- [ ] Type-check passa (`npx tsc --noEmit`)
- [ ] Build de produção passa (`npm run build`)
- [ ] E2E Playwright passa (`npm run test:api && npm run test:ui`)
- [ ] `npm audit` sem vulnerabilidades high/critical
- [ ] Documentação atualizada (CLAUDE.md, README, ADRs)
- [ ] Migrations Prisma prontas e testadas
- [ ] Variáveis de ambiente novas documentadas em `.env.example`
- [ ] Tag de versão criada (SemVer)
- [ ] Changelog/release notes atualizado

## Processo de Release

### 1. Prepare

```bash
# Garante main atualizada
git checkout main
git pull origin main

# Verifica que CI está passando na main
# (via GitHub Actions)

# Confirma cobertura final
npm run test:cov
```

### 2. Decida a versão

Use SemVer:
- Mudança breaking? → bump MAJOR
- Nova feature? → bump MINOR
- Bug fix? → bump PATCH

PedAII está em 0.x.y. MINOR bump = nova feature, PATCH bump = fix.

### 3. Atualize o changelog

Mantenha `CHANGELOG.md` (criar se não existir) com:

```markdown
## [0.5.0] - 2026-06-15

### Adicionado
- feat(restaurante): CRUD completo com validação de CNPJ
- feat(auth): refresh token rotation

### Corrigido
- fix(perfis): N+1 query ao listar perfis com permissões

### Mudado
- refactor(usuarios): extrair VO Email

### Breaking
- (nenhum)
```

### 4. Tag

```bash
git tag -a v0.5.0 -m "Release 0.5.0 — Restaurantes CRUD + auth hardening"
git push origin v0.5.0
```

**Tag anotada** (`-a`) com mensagem. Tags lightweight não têm mensagem.

### 5. Deploy

CI deve disparar deploy automaticamente na tag (configurar em `.github/workflows/`).

**Se deploy manual:**
```bash
ssh user@vps
cd /root/pedi-ai-api
git fetch --tags
git checkout v0.5.0
npm ci --production
npm run build
npx prisma migrate deploy
pm2 restart pedi-ai-api  # ou systemctl restart
curl http://localhost:3001/health  # smoke test
```

### 6. Smoke test pós-deploy

- `GET /health` retorna 200
- Login funciona (`POST /auth/login` retorna 200)
- Endpoint crítico responde (`GET /restaurants` autenticado)
- Logs não mostram stacktrace não-tratada

### 7. Comunique

- Comentário no PR/issue referenciando a tag
- Notifique stakeholders se for release maior
- Documente a release no board/tracker

## Rollback

Se algo der errado em prod:

### Rollback rápido (mesma release)

```bash
# Identificar último release bom
git log --oneline -10

# Reverter commit
git revert <hash>
git push origin main  # CI faz deploy do revert
```

### Rollback de versão (deploy de tag anterior)

```bash
ssh user@vps
cd /root/pedi-ai-api
git checkout v0.4.0
npm ci --production
npm run build
pm2 restart pedi-ai-api
```

**Atenção:** se houver migration de banco, rollback é mais complexo. Planeje migrations como reversíveis.

### Pós-rollback

- [ ] Comunicar stakeholders
- [ ] Abrir issue com causa raiz
- [ ] Hotfix planejado em separado

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Deploy direto, sem CI" | Deploy sem CI = bug em prod. CI é o gate. |
| "Skip smoke test, está tudo ok" | Smoke test é barato. Downtime é caro. |
| "Vou commitar fix direto em prod" | Hotfix em prod sem branch = impossível auditar. |
| "Migration não precisa de reversão" | Toda migration pode falhar. Planeje reversão. |
| "Tag é cerimônia" | Tag é o ponto de release. Sem tag, sem rollback limpo. |
| "Changelog é overhead" | Changelog é o que entrou. Sem ele, surpresa em prod. |

## Red Flags

- Deploy sem CI passando
- Tag sem changelog
- Migration não reversível sem plano de rollback
- Deploy sexta à tarde (ninguém disponível para rollback)
- Sem health check pós-deploy
- Secrets em tag (vaza no git log)
- Force-push na main durante release
- Múltiplas features numa única release (dificulta rollback)

## Verificação

- [ ] Todos os RFs implementados
- [ ] Cobertura ≥ 80%
- [ ] Lint, type-check, build passando
- [ ] E2E Playwright passando
- [ ] `npm audit` limpo
- [ ] Changelog atualizado
- [ ] Tag anotada com mensagem
- [ ] Deploy executado
- [ ] Health check 200
- [ ] Smoke test dos endpoints críticos
- [ ] Stakeholders comunicados (se major)
