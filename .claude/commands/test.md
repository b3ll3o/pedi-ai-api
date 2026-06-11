---
name: test
description: Prova que funciona. Roda a suite de testes, analisa cobertura, identifica gaps. Use antes de merge, ou ao suspeitar de regressão. Use para diagnóstico via persona `test-engineer`.
---

# /test — Provar Que Funciona

**Argumentos opcionais:** caminho específico de teste ou suite (`unit`, `e2e`, `coverage`).

## O que este comando faz

1. Roda a suite de testes apropriada
2. Analisa cobertura (`npm run test:cov`)
3. Identifica gaps (paths não cobertos, edge cases)
4. Reporta findings no formato do persona `test-engineer`
5. Propõe testes adicionais se gap for crítico

## Skills ativadas

- `using-agent-skills`
- `test-driven-development`
- `browser-testing-with-devtools` (se UI)

## Personas invocadas

- `test-engineer` (para análise de gaps)

## Pré-condição

- Código existe
- Testes configurados (Jest, Playwright, conforme subprojeto)

## Etapas

1. **Identifique o escopo:**
   - Por argumento: arquivo ou suite
   - Default: tudo disponível

2. **Rode a suite:**
   ```bash
   # api
   npm test                 # unitários
   npm run test:e2e         # E2E (Jest + supertest)
   npm run test:cov         # com cobertura

   # app
   npm test
   npm run test:coverage

   # e2e
   npm run test:api         # testes de API
   npm run test:ui          # testes de UI
   ```

3. **Colete métricas:**
   - Total de testes
   - Passou/Falhou/Skipped
   - Cobertura: statements, branches, functions, lines
   - Tempo total

4. **Aplique persona `test-engineer`:**
   - Identifique gaps
   - Classifique por severidade
   - Proponha testes adicionais

5. **Reporte no formato:**

   ```markdown
   ## Resultado dos Testes: <escopo>

   ### Resumo
   - Total: X testes
   - Passou: Y
   - Falhou: Z
   - Cobertura: A%

   ### Cobertura por Arquivo
   | Arquivo | % | Status |
   |---------|---|--------|
   | ... | ... | 🟢/🟡/🔴 |

   ### Gaps Identificados
   #### [Crítico] ...
   #### [Importante] ...
   #### [Nit] ...

   ### Recomendações
   - Adicionar teste para <X>
   - Refatorar <Y> (flaky)
   ```

6. **Falhas específicas:**
   - Para cada falha, rode `debugging-and-error-recovery` (5 etapas: reproduzir, isolar, entender, corrigir, prevenir)

## Saída esperada

- Métricas de suite
- Mapa de cobertura
- Lista priorizada de gaps
- Testes sugeridos (não implementados — `/build` para implementar)

## Exemplo

```
Usuário: /test

Agente: Rodando suite de testes...

✅ Unitários: 142/142 passam (3.2s)
✅ E2E Jest: 24/24 passam (8.5s)
⚠️ Cobertura: 78% (target ≥ 80%)

Arquivos abaixo do threshold:
- src/restaurante/infrastructure/prisma.repository.ts: 65% 🔴
- src/perfis/application/criar-perfil.use-case.ts: 72% 🟡

Gaps:
- [Crítico] Repository de restaurante não tem teste de soft delete
- [Importante] CriarPerfilUseCase não cobre validação de nome duplicado

Recomendação: adicionar 3 testes. /build para implementar?
```
