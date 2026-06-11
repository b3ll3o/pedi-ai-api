---
name: performance-checklist
description: Checklist de performance para backend e frontend. Carregue quando persona `web-performance-auditor` revisar, ou antes de release.
---

# Checklist de Performance

## Backend (NestJS + Prisma)

### Banco de Dados

- [ ] Toda query com `take` (paginação) — sem `findMany` sem limite
- [ ] Índices em colunas filtradas (`@@index` no schema)
- [ ] Sem N+1 queries (usar `include` ou batch)
- [ ] Sem `prisma.$queryRaw` sem necessidade
- [ ] Soft delete filtrado consistentemente (`where: { deletedAt: null }`)
- [ ] Transações para ops multi-modelo (`prisma.$transaction`)
- [ ] Conexão de pool configurada (`pg.Pool max=20`)

### Latência

- [ ] Endpoints simples < 200ms (P95)
- [ ] Endpoints com DB < 500ms (P95)
- [ ] Endpoints com agregação < 2s (P95)
- [ ] Health check < 50ms

### Caching

- [ ] Cache em memória para dados estáticos (ex: lista de roles)
- [ ] Headers `Cache-Control` em responses cacheáveis
- [ ] ETag para conteúdo que muda devagar
- [ ] Invalidação de cache explícita (não "esquecer")

### Async

- [ ] Operações I/O em async/await (não sync)
- [ ] I/O independente em paralelo (`Promise.all`)
- [ ] Sem bloqueios em hot path

### Logging de Performance

- [ ] Latência medida em endpoints críticos (middleware)
- [ ] Request ID propagado em logs
- [ ] Slow query log habilitado no PostgreSQL

## Frontend (Next.js 16 + React 19)

### Core Web Vitals (Mobile, 4G)

| Métrica | Bom | Onde Medir |
|---------|-----|------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse, Web Vitals |
| **INP** (Interaction to Next Paint) | < 200ms | Web Vitals |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Web Vitals |
| **FCP** (First Contentful Paint) | < 1.8s | Lighthouse |
| **TTFB** (Time to First Byte) | < 600ms | Network tab |

### Bundle

- [ ] First Load JS < 200 KB (rota típica)
- [ ] Largest route < 250 KB
- [ ] Sem lib não-tree-shakeable
- [ ] Vendor chunk separado
- [ ] Bundle analyzer rodado (`@next/bundle-analyzer`)

### Imagens

- [ ] `next/image` em toda imagem (lazy, otimização automática)
- [ ] `width` e `height` explícitos (evita CLS)
- [ ] `priority` em imagem LCP (above the fold)
- [ ] Formato moderno (AVIF, WebP)

### Fontes

- [ ] `next/font` (self-hosted, sem FOUT)
- [ ] `font-display: swap` (Padrão do next/font)
- [ ] Pré-carregamento de fontes críticas (`preload`)

### Componentes

- [ ] Server Component por default (evita JS no client)
- [ ] `'use client'` só quando necessário
- [ ] `React.lazy` + `Suspense` em componentes pesados
- [ ] `dynamic(() => import(...))` em rotas/componentes raramente usados
- [ ] `useMemo` / `useCallback` em hot path (após medir)
- [ ] Virtual list em lista > 50 itens (`react-window`)

### Network

- [ ] `<link rel="preconnect">` em API externa crítica
- [ ] `<link rel="preload">` em asset crítico
- [ ] HTTP/2 habilitado (Padrão Vercel/Next)
- [ ] Compressão gzip/brotli habilitada
- [ ] Cache-Control em assets estáticos
- [ ] Sem request duplicado (dedupe)

### Renderização

- [ ] Sem re-render desnecessário (verificar com React DevTools Profiler)
- [ ] Estado colocalizado (não global sem necessidade)
- [ ] Context não usado para dados que mudam frequentemente
- [ ] `key` estável em listas (evita remontagem)

### Hidratação

- [ ] Server Component renderiza o máximo possível
- [ ] Client Component mínimo necessário
- [ ] Sem hidratação com fetch em `useEffect` (usar Server Component)

## Anti-Patterns

| Anti-pattern | Impacto | Correção |
|--------------|---------|----------|
| Imagem sem `width`/`height` | CLS alto | Sempre dimensions explícitas |
| Fetch em `useEffect` na raiz | TTFB + LCP alto | Server Component ou SWR/React Query |
| `useState` para tudo | Re-renders | Context, Zustand, ou Server |
| Loop com DB | N+1 queries | `where: { id: { in: ids } }` |
| Sem paginação | Memória + latência | `take` + `skip` |
| Bundle único grande | TTI alto | Code split, dynamic import |
| `<img>` em vez de `next/image` | LCP alto | `next/image` |
| Fonte externa | FOUT | `next/font` self-hosted |
| `setTimeout` em render | Layout shift | Skeleton/Suspense |
| `console.log` em prod | Overhead + leak | Remover em build |

## Comandos Úteis

```bash
# Backend
EXPLAIN ANALYZE <query>           # PostgreSQL query plan
npx prisma studio                  # GUI do banco
npx clinic doctor                  # Node profiling

# Frontend
npx lighthouse <url> --view        # Auditoria completa
npx @next/bundle-analyzer          # Bundle analysis
```

## Checklist Pré-Deploy

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Lighthouse SEO ≥ 90
- [ ] Bundle size verificado
- [ ] Sem imagens sem `alt`
- [ ] Sem `console.log` em prod
- [ ] Sem warning de hydration mismatch
- [ ] Web Vitals medidos em staging
