---
name: build
description: Constrói incrementalmente. Ativa `incremental-implementation` e `test-driven-development` para implementar as tarefas planejadas. Use após `/plan`.
---

# /build — Construir Incrementalmente

**Argumentos opcionais:** ID da tarefa (T-XX) ou nome do domínio.

## O que este comando faz

1. Carrega a skill de domínio e o `tasks.md`
2. Implementa as tarefas em ordem de dependência (uma de cada vez, ou em paralelo quando marcado `[P]`)
3. Para cada tarefa:
   - Aplica `test-driven-development` (teste primeiro)
   - Implementa o código mínimo
   - Refatora
   - Valida (lint, test, coverage)
   - Marca `- [x]` em `tasks.md`
4. Commita com mensagem rastreável

## Skills ativadas

- `using-agent-skills`
- `incremental-implementation`
- `test-driven-development`
- `planning-and-task-breakdown` (para consultar ordem)

## Pré-condição

- `tasks.md` deve existir
- Se não existir, redirecione para `/plan` primeiro

## Etapas

1. **Identifique o escopo:**
   - Por argumento: tarefa específica (`/build T-05`)
   - Por argumento: domínio completo (`/build restaurante`)
   - Por contexto: próxima tarefa pendente

2. **Para cada tarefa (sequencial ou paralelo):**
   - **🔴 RED**: Escreva teste que falha
   - **🟢 GREEN**: Código mínimo para passar
   - **🔵 REFACTOR**: Limpe mantendo verde
   - **VALIDAÇÃO**:
     - `npm run lint` — sem erros
     - `npm test` — passa
     - `npm run test:cov` — ≥ 80% mantido
     - `npx tsc --noEmit` — sem erros
   - **TAREFA**: Marque `- [x]` em `tasks.md`
   - **COMMIT**: Mensagem rastreável (Conventional Commits)

3. **Pause e relate progresso:**
   - Quantas tarefas concluídas
   - Quantas faltam
   - Se bloqueado, qual issue

4. **Continue até:**
   - Todas tarefas completas
   - Usuário interrompe
   - Erro/bloco encontrado (pause e relate)

## Modo `auto`

`/build auto` (experimental): gera o plano (se não existir) e implementa cada task em uma única passada aprovada. **Use com cuidado** — viola o ciclo de checkpoints que é a razão de ser desta skill.

**Recomendado PediAI MVP:** prefira `/build T-XX` (uma tarefa por vez) para manter controle.

## Saída esperada

- Código implementado
- Testes passando
- Coverage ≥ 80%
- `tasks.md` atualizado
- Commits com mensagem rastreável

## Exemplo

```
Usuário: /build T-05

Agente: T-05: Criar entidade Restaurante com validação de CNPJ.

🔴 RED: Escrevendo teste em restaurante.entity.spec.ts
- "deve criar restaurante com CNPJ válido"
- "deve lançar CNPJInvalidoError para CNPJ inválido"
- "deve aceitar CNPJ formatado e não-formatado"

🟢 GREEN: Implementando entidade...
- Validação de 14 dígitos
- Dígitos verificadores
- Formatação/normalização

🔵 REFACTOR: Extraindo CNPJ para Value Object.

✅ npm test: 12/12 passam
✅ npm run test:cov: 87% (mantém ≥ 80%)
✅ npm run lint: sem erros
✅ npx tsc --noEmit: sem erros

Commit: feat(restaurante): adicionar entidade com validação de CNPJ (T-05)

Próxima: T-06 (Repository Prisma). /build?
```
