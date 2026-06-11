---
name: ship
description: Envia para produção. Orquestra 3 personas em paralelo (code-reviewer, security-auditor, test-engineer), sintetiza relatório go/no-go. Use antes de deploy.
---

# /ship — Enviar Para Produção

**Argumentos opcionais:** tag de versão (`v0.5.0`) ou "dry-run" (sem tag).

## O que este comando faz

1. Identifica mudanças a serem lançadas (`git diff main`, commits desde último release)
2. **Fan-out paralelo**: invoca 3 personas simultaneamente:
   - `code-reviewer` — revisão multi-eixo
   - `security-auditor` — auditoria OWASP
   - `test-engineer` — análise de testes
3. **Síntese**: agrega os 3 relatórios em veredicto go/no-go
4. Se aprovado: cria tag, atualiza changelog, dispara deploy

## Skills ativadas

- `using-agent-skills`
- `code-review-and-quality`
- `security-and-hardening`
- `test-driven-development`
- `git-workflow-and-versioning`
- `shipping-and-launch`
- `ci-cd-and-automation`

## Personas invocadas (paralelo)

- `code-reviewer`
- `security-auditor`
- `test-engineer`

## Pré-condição

- Mudanças staged ou commits novos desde último release
- CI passando (verificar status)

## Etapas

### 1. PRÉ-CHECKS

Antes de fan-out, valide os gates obrigatórios:

- [ ] Cobertura ≥ 80%
- [ ] Lint sem erros
- [ ] Type-check sem erros
- [ ] Build passa
- [ ] CI está passando na main

Se algum falhar, **PARE** e exija fix.

### 2. FAN-OUT PARALELO (3 personas em paralelo)

Cada persona recebe o mesmo diff/commits, mas analisa por lente diferente:

```
[Paralelo]
├── code-reviewer: corretude, legibilidade, arquitetura, segurança, performance
├── security-auditor: OWASP Top 10 + checks PediAI
└── test-engineer: cobertura, gaps, pirâmide
```

**Cada persona produz seu relatório** no formato próprio.

### 3. SÍNTESE

Agregue os 3 relatórios em veredicto único:

```markdown
## Ship Decision: <versão ou escopo>

### Pré-checks
- [x] Cobertura: 87%
- [x] Lint: 0 erros
- [x] Type-check: 0 erros
- [x] Build: sucesso
- [x] CI: passing

### Findings Consolidados
| Persona | Crítico | Alto | Médio | Baixo | Info |
|---------|---------|------|-------|-------|------|
| code-reviewer | 0 | 1 | 2 | 3 | 1 |
| security-auditor | 0 | 0 | 1 | 2 | 0 |
| test-engineer | 0 | 0 | 0 | 1 | 2 |
| **Total** | **0** | **1** | **3** | **6** | **3** |

### Bloqueios para Ship
- [Alto] code-reviewer: <título e link>
- [Médio] security-auditor: <título e link>

### Veredicto
🟢 GO | 🟡 GO COM RESSALVAS | 🔴 NO-GO
```

**Critérios de veredicto:**

| Veredicto | Condição |
|-----------|----------|
| 🟢 **GO** | 0 crítico, 0 alto |
| 🟡 **GO COM RESSALVAS** | 0 crítico, ≥ 1 alto (justificar) |
| 🔴 **NO-GO** | ≥ 1 crítico ou ≥ 3 alto |

### 4. SE APROVADO

Aplique `shipping-and-launch`:

1. Crie/atualize `CHANGELOG.md`
2. Crie tag anotada: `git tag -a v0.5.0 -m "..."`
3. Push: `git push origin v0.5.0`
4. CI dispara deploy (ver `ci-cd-and-automation`)
5. Smoke test pós-deploy
6. Comunique stakeholders (se release maior)

### 5. SE REPROVADO

- Liste os bloqueios
- Sugira `/build` para corrigir
- Não commite a tag

## Saída esperada

- Veredicto claro (GO / GO COM RESSALVAS / NO-GO)
- Findings consolidados
- Tag criada (se GO)
- Deploy disparado (se tag pushada)

## Exemplo

```
Usuário: /ship v0.5.0

Agente: Verificando pré-checks...
✅ Cobertura 87% (≥ 80%)
✅ Lint 0 erros
✅ Build sucesso
✅ CI passing

Invocando 3 personas em paralelo...

[code-reviewer] Findings: 1 alto, 2 médios, 3 baixos
[security-auditor] Findings: 0 alto, 1 médio, 2 baixos
[test-engineer] Findings: 0 alto, 0 médio, 1 baixo

Total: 0 crítico, 1 alto, 3 médios, 6 baixos

Bloqueios:
- [Alto] code-reviewer: Query N+1 em listar restaurantes com permissões (perf)

Veredicto: 🔴 NO-GO

Recomendação: aplicar fix de N+1 (índice + include), depois /ship de novo.
```
