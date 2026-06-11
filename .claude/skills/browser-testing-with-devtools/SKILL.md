---
name: browser-testing-with-devtools
description: Testa no browser usando DevTools. Use ao debugar UI, investigar problema de renderização, ou validar comportamento client-side. Use antes de declarar uma feature de UI como pronta.
---

# Testes em Browser com DevTools

## Visão Geral

Testes automatizados (Jest, Playwright) cobrem fluxo conhecido. DevTools cobre o **desconhecido**: race conditions visuais, layout em viewport não-testado, console errors, network waterfall. Esta skill ensina a usar DevTools de forma metódica para validar UI antes de merge.

## Quando Usar

- Debug de UI reportada por usuário
- Validação de feature de UI antes de PR
- Investigação de problema de performance visual
- Antes de release (smoke test em flows críticos)
- Ao desenvolver componente que toca layout, animação, ou estado complexo

## Processo

### 1. REPRODUZIR

- Abra DevTools (F12)
- Vá para a aba **Console** primeiro
- Reproduza o fluxo reportado
- Anote: erros no console, warnings, exceptions não-tratadas

### 2. INVESTIGAR

Use a aba certa para o sintoma:

| Sintoma | Aba | O que procurar |
|---------|-----|----------------|
| UI não atualiza | React DevTools / Components | Estado não mudou, re-render não disparou |
| Layout quebrado | Elements / Styles | CSS computado, conflitos de especificidade |
| Lento | Performance / Lighthouse | Long tasks, layout thrashing, re-renders |
| Request falhou | Network | Status, response, CORS, payload |
| Erro runtime | Console | Stack trace, source map |
| Memória crescendo | Memory | Heap snapshot, detached nodes |
| Cookie/sessão | Application / Storage | Tokens, expiry, httpOnly |

### 3. ENTENDER

- **Network:** qual request falhou? Payload correto? Status esperado?
- **Console:** erro é do seu código ou de lib? Stack trace aponta para onde?
- **Performance:** qual frame está > 16ms? (60fps = 16.67ms/frame)
- **Memory:** há leak? Listeners não removidos? Cache sem TTL?

### 4. FIX

Com causa identificada:
- Volte para o código com contexto claro
- Aplique TDD se for bug (teste que reproduz → fix → teste passa)
- Documente o root cause

### 5. VALIDAR pós-fix

- Recarregue (hard refresh: Ctrl+Shift+R)
- Limpe cache se necessário
- Verifique console limpo
- Teste o fluxo original novamente
- Smoke test de fluxos adjacentes

## Atalhos Úteis

| Ação | Chrome | Firefox |
|------|--------|---------|
| DevTools | F12 / Ctrl+Shift+I | F12 |
| Inspect | Ctrl+Shift+C | Ctrl+Shift+C |
| Hard refresh | Ctrl+Shift+R | Ctrl+Shift+R |
| Clear cache | DevTools aberto → Reload direito → "Empty Cache and Hard Reload" | DevTools aberto → Reload direito |
| Toggle device | Ctrl+Shift+M | Ctrl+Shift+M |
| Network throttling | DevTools → Network → "Slow 3G" | Network conditions |

## Validações Comuns no PediAI

| Cenário | Check DevTools |
|---------|----------------|
| Login funciona | Network: POST /auth/login → 200; cookie set; localStorage populado |
| Auto-refresh em 401 | Network: request original → 401 → /auth/refresh → 200 → request original re-feita |
| ProtectedRoute redireciona | Console: sem erro; Network: navegação para /login |
| AdminOnly esconde UI | Elements: botão não está no DOM (não tem `display: none`) |
| Performance UI | Lighthouse: Performance ≥ 90; LCP < 2.5s; CLS < 0.1 |
| Soft delete | Network: DELETE → 204; GET subsequente não retorna o item |

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Teste automatizado cobre" | Teste cobre fluxo conhecido. Não cobre edge de viewport, race, ou estado real. |
| "Está funcionando visualmente" | Visual ≠ funcional. Console pode estar cheio de erros. |
| "Vou pular DevTools pra economizar tempo" | DevTools em 5 min acha bug que 1 hora de código não acha. |
| "Network está ok, vi o 200" | 200 com payload errado é bug. Verifique o body. |
| "Performance parece rápida" | "Parece" ≠ medida. Lighthouse ou Performance tab dão números. |
| "Cookie está setado" | httpOnly false em prod é XSS vector. Verifique flags. |

## Red Flags

- Console com erro/warning não-investigado
- Network com 4xx/5xx ignorado
- Layout funciona em 1 viewport só (mobile? 4K? landscape?)
- Memory cresce sem explicação
- Performance > 100ms sem motivo aparente
- Teste "passou" mas UI não funciona
- Sem smoke test antes de release
- Hard refresh não testado (cache esconde bugs)

## Verificação

- [ ] Console limpo (sem erro/warning)
- [ ] Network sem request falhado
- [ ] Layout responsivo (mobile, tablet, desktop)
- [ ] Performance aceitável (Lighthouse ≥ 90)
- [ ] Funcionalidade validada no flow original
- [ ] Smoke test de fluxos adjacentes
- [ ] Hard refresh testado
- [ ] Sem memory leak visível em sessão prolongada
