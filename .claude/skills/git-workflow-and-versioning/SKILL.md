---
name: git-workflow-and-versioning
description: Padroniza uso de git e versionamento semântico. Use ao criar commit, branch, tag, ou PR. Use para resolver conflitos. Use para manter histórico limpo.
---

# Workflow de Git e Versionamento

## Visão Geral

Git é a história do código. Histórico limpo permite bisectar, blame, e entender evolução. PediAI opera com **commits diretos na main** (regra MVP), mas a estrutura de commits, mensagens, e tags segue convenção para que seja possível auditar, reverter, e migrar para PR-based no futuro.

## Quando Usar

- Antes de cada commit (mensagem)
- Ao criar branch (mesmo que efêmera)
- Ao criar tag de release
- Ao resolver conflito
- Antes de fazer push
- Ao bisectar bug

## Convenção de Mensagem de Commit

PediAI usa **Conventional Commits** simplificado:

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional — por que, não o quê>

<rodapé opcional — referências, breaking changes>
```

| Tipo | Quando | Exemplo |
|------|--------|---------|
| `feat` | Nova feature | `feat(auth): adicionar refresh token rotation` |
| `fix` | Bug fix | `fix(restaurante): validar CNPJ com dígitos verificadores` |
| `refactor` | Mudança que não altera comportamento | `refactor(usuarios): extrair validacao de email para VO` |
| `test` | Adicionar/corrigir testes | `test(perfis): cobrir caminho de delete com FK` |
| `docs` | Apenas documentação | `docs(readme): adicionar setup do postgres` |
| `chore` | Manutenção, deps, build | `chore(deps): atualizar prisma para 5.22` |
| `perf` | Performance | `perf(restaurante): adicionar índice em cnpj` |
| `ci` | CI/CD | `ci(api): rodar audit antes de deploy` |

**Escopo:** domínio (`auth`, `restaurante`, `perfis`) ou área (`api`, `app`, `e2e`, `deps`, `ci`).

**Corpo (opcional mas recomendado):** "por que" — o contexto que justifica a mudança. Sem repetir o diff.

**Rodapé:**
- `BREAKING CHANGE: <descrição>` quando aplicável
- `Ref: openspec/legacy/specs/<domin>/spec.md` se referenciar OpenSpec antigo (até migração completa)

## Versionamento Semântico (SemVer)

Tags no formato `vMAJOR.MINOR.PATCH`:

- **MAJOR**: mudança breaking (incompatível com versão anterior)
- **MINOR**: nova feature, compatível
- **PATCH**: bug fix, compatível

PedAII está em pré-1.0 (MVP), então:
- **0.MINOR.0** para features (0.1.0, 0.2.0, ...)
- **0.MINOR.PATCH** para fixes (0.1.1, 0.1.2, ...)

## Branches

| Padrão | Uso |
|--------|-----|
| `main` | Branch de produção |
| `feat/<escopo>-<descrição-curta>` | Feature em desenvolvimento |
| `fix/<escopo>-<descrição-curta>` | Bug fix |
| `chore/<escopo>-<descrição-curta>` | Manutenção |

**Regra PediAI MVP:** commits diretos na `main` são permitidos, mas use branches para mudanças arriscadas (auth, schema, multi-arquivo).

## Resolução de Conflitos

1. **Atualize sua branch** com a main antes de continuar: `git pull --rebase origin main`
2. **Leia o conflito** com `git diff --name-only --diff-filter=U` para mapear arquivos
3. **Para cada arquivo conflitado:**
   - Abra o arquivo
   - Identifique intenção de cada lado
   - Combine mantendo ambas as intenções se possível
   - Rode testes
4. **Force-with-lease** ao push após rebase (nunca `--force` simples)

## Boas Práticas

- **Commits atômicos** — 1 commit = 1 mudança lógica
- **Não comitar** secrets, `.env`, `node_modules`, `dist/`
- **Não comitar** código não relacionado (ex: formatar 10 arquivos numa feature de 1)
- **Escreva mensagens no imperativo** ("adicionar" não "adicionado")
- **Bisecte** quando algo regressiu (`git bisect` automatiza a busca do commit culpado)
- **Stash** mudanças incompletas antes de trocar de branch
- **Force-push com cuidado** — apenas em branches pessoais, nunca na main compartilhada

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Mensagem não importa, o diff está aí" | Mensagem é o sumário. Diff é o detalhe. Sumário ruim = hora de debug perdida. |
| "Vou commitar tudo junto, é mais rápido" | Commits juntos viram commits impossíveis de reverter. |
| "Vou commitar .env pra subir pro server" | .env em git = secret leak. Use env vars no server. |
| "Squash tudo, fica mais limpo" | Squash de feature branch = ok. Squash de main = perde histórico. |
| "Force-push na main, é só correção" | Force-push na main reescreve história compartilhada. NUNCA. |
| "Tag é só cerimônia" | Tag é o ponto de release. Sem tag, sem rollback limpo. |

## Red Flags

- Commit sem tipo ou escopo
- Mensagem genérica ("update", "fix", "wip")
- Commit com 50 arquivos não relacionados
- `.env` ou `node_modules` em git
- Force-push na main
- Tag sem changelog ou release notes
- Branch sem nome descritivo
- Conflitos resolvidos sem rodar testes
- `git add .` quando há arquivos não relacionados staged
- Commits "WIP" mergeados na main

## Verificação

- [ ] Mensagem segue Conventional Commits
- [ ] Escopo claro (`feat(<domínio>): ...`)
- [ ] Corpo explica "por que" (não "o que")
- [ ] Commit atômico (1 mudança lógica)
- [ ] Nenhum secret/.env commitado
- [ ] `git log` limpo, sem WIP ou merge desnecessário
- [ ] Tag anotada (`git tag -a vX.Y.Z -m "..."`)
- [ ] `git status` limpo antes do push
