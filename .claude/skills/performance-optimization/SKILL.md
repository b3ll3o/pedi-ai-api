---
name: performance-optimization
description: Otimiza performance de código e sistemas. Use quando tempos de resposta degradam, queries estão lentas, ou após `code-review-and-quality` sinalizar problemas de performance. Use para otimização proativa em hot paths.
---

# Otimização de Performance

## Visão Geral

Performance é feature. Otimizar sem medir é adivinhação; otimizar sem provar é presunção. Esta skill implementa: **MEDIR → IDENTIFICAR → OTIMIZAR → MEDIR DE NOVO** — ciclo que garante ganho real e não regressão.

## Quando Usar

- Tempo de resposta degradou em monitoramento
- Usuários reportam lentidão
- `code-review-and-quality` sinalizou problema de performance
- Antes de feature que pode causar carga (relatórios, listagens grandes)
- Em revisão periódica (trimestral)

## Processo

### 1. MEDIR baseline

**Antes de qualquer mudança, meça o estado atual.**

- `curl -w "%{time_total}\n"` em endpoints críticos
- `EXPLAIN ANALYZE` em queries Prisma
- `npx clinic doctor` ou `clinic flame` para Node.js
- Lighthouse / Web Vitals para frontend
- Logs de produção (P95, P99)

**Documente:** tempo médio, P95, P99, queries por request, memory usage.

### 2. IDENTIFICAR gargalo

Não otimize tudo — otimize o gargalo.

| Sintoma | Provável causa | Onde olhar |
|---------|----------------|------------|
| Endpoint lento | N+1 queries | Loops com chamada a DB |
| Memória crescendo | Leak | Listeners não removidos, cache sem TTL |
| Frontend lento | Re-renders | Falta de `useMemo`/`useCallback` em hot paths |
| CPU alto | Regex catastrófica | Validações com backtracking |
| I/O bloqueante | Sync em vez de async | `fs.readFileSync` em request handler |

### 3. OTIMIZAR (com TDD)

**Otimize com cobertura de teste para garantir que não regrediu.**

- **DB:** adicionar índice, usar `include`/batch, evitar `SELECT *`
- **Backend:** memoizar, paginar, paralelizar I/O independente
- **Frontend:** virtualizar listas longas, lazy load, code split
- **Network:** compressão (gzip), HTTP cache headers, ETag
- **Caching:** Redis para dados quentes, mas invalidar corretamente

**Não otimize prematuramente.** Se P95 < 100ms e uso é baixo, não mexa.

### 4. MEDIR DE NOVO

Compare com baseline. Se piorou ou ficou igual, reverta. Se melhorou ≥ 20%, considere commitar.

## Padrões PediAI

| Local | Padrão |
|-------|--------|
| `prisma.X.findMany` | Sempre com `take` (paginação) |
| `prisma.X.findUnique` | Garante índice na coluna |
| Loops com DB | Usar `findMany` com `where: { id: { in: ids } }` |
| `useEffect` com fetch | Empty deps + AbortController; ou SWR/React Query |
| Componentes pesados | `React.lazy` + `Suspense` |
| Listas > 50 itens | Virtualização (`react-window`) |

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Otimizar deixa o código mais complexo" | Otimização prematura sim. Otimizar gargalo medido reduz custo total. |
| "Está rápido o suficiente" | Para 10 usuários sim. Para 10k, é incidente. |
| "Vou adicionar cache e resolver" | Cache sem invalidação é bug esperando para acontecer. |
| "Banco lento, vamos escalar" | Escalar antes de otimizar query é jogar dinheiro fora. |
| "Vou reescrever em Rust" | Reescrita resolve performance, adiciona complexidade. Faça se for o gargalo. |
| "Ninguém vai usar tanto assim" | Se for exposto, será usado. Carga orgânica é real. |

## Red Flags

- Otimizar sem medir antes
- Otimizar sem cobertura de teste (vai regredir sem aviso)
- Cache sem invalidação explícita
- Índice em coluna com baixa cardinalidade
- Paginação sem `take` (memória cresce)
- `await` em loop (paralelize com `Promise.all`)
- Sync I/O em request handler
- Otimização "porque sim" sem sintoma

## Verificação

- [ ] Baseline medido e documentado
- [ ] Gargalo identificado com evidência
- [ ] Otimização tem teste de regressão (bench, E2E, ou unit)
- [ ] Pós-otimização medido vs baseline
- [ ] Ganho ≥ 20% (se menos, reconsiderar)
- [ ] Sem regressão em outras métricas (memória, CPU, latência de outros endpoints)
- [ ] Coverage ≥ 80% mantida
- [ ] Mudança documentada em ADR se for estrutural
