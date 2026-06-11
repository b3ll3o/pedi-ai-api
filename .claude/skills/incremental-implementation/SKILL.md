---
name: incremental-implementation
description: Constrói features em fatias pequenas, com checkpoints frequentes. Use ao implementar qualquer feature. Use quando o trabalho parece grande demais para uma sessão. Use para evitar o anti-pattern "big bang release".
---

# Implementação Incremental

## Visão Geral

Implementar uma feature em **fatias verticais pequenas** (cada uma entregando valor de ponta a ponta) em vez de **camadas horizontais** (todas as entidades, depois todos os use cases, depois todos os controllers). O objetivo é ter **algo funcionando o quanto antes**, mesmo que mínimo, e iterar.

## Quando Usar

- Em qualquer feature standard ou major
- Quando o `tasks.md` tem mais de 10 tarefas
- Quando paralelização faz sentido
- Quando o time precisa de demo de progresso
- Quando o risco de retrabalho é alto (especificação pode mudar)

## Quando NÃO Usar

- Mudanças triviais (1-2 arquivos)
- Bug fixes (use `test-driven-development` com pattern "Prove-It")
- Hotfixes de produção (use branch isolada + ship rápido)

## Processo

1. **Leia o `tasks.md`** criado por `planning-and-task-breakdown`
   - Identifique a primeira fatia vertical (foundation: entidade + use case mínimo + 1 endpoint + teste)

2. **Implemente a fatia via TDD** (`test-driven-development`)
   - Teste primeiro
   - Código mínimo para passar
   - Refactor
   - Commit com mensagem rastreável

3. **Pare e valide**
   - Rode `npm test` (passa?)
   - Rode `npm run test:cov` (≥ 80%?)
   - Rode `npm run lint` (sem erros?)
   - Rode `npx tsc --noEmit` (sem erros?)
   - Se tudo ok → commit → próxima fatia

4. **Documente progresso no `tasks.md`**
   - Marque `- [x]` em tarefas concluídas
   - Adicione notas inline se descobriu algo durante implementação

5. **Repita até completar**
   - Tarefas marcadas `[P]` (paralelas) podem ser feitas em paralelo por subagents
   - Se encontrar issue de design, pause e atualize a skill de domínio antes de continuar

## Tamanho da Fatia

| Tamanho | Diretriz |
|---------|----------|
| ~100 linhas | Ideal — 1 sessão, 1 commit |
| ~300 linhas | Aceitável para fatia mais complexa |
| 1 dia | Máximo — além disso, quebrar |

**Regra:** se a fatia não pode ser demonstrada funcionando, é grande demais.

## Estratégia de Fatiamento Vertical

```
Fatia 1: Criar Restaurante (mínimo)
├── Entidade Restaurante (validação de nome apenas)
├── Repository.create (Prisma)
├── CriarRestauranteUseCase
├── POST /restaurants
└── Teste E2E: admin cria restaurante → 201

Fatia 2: Listar
├── ListarRestaurantesUseCase
├── GET /restaurants
└── Teste E2E: admin lista → 200 com 1 item

Fatia 3: Buscar por ID
├── ...

Fatia 4: Atualizar
├── ...

Fatia 5: Soft delete
├── ...
```

**Não:**
```
❌ Sprint 1: Todas as entidades do schema
❌ Sprint 2: Todos os repositórios
❌ Sprint 3: Todos os use cases
❌ Sprint 4: Todos os controllers
```

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Vou fazer tudo de uma vez pra acabar logo" | Tudo de uma vez = bug de uma vez. Corrigir é mais caro que fatiar. |
| "Fatia pequena demais = overhead" | Overhead de 1 commit é 30 segundos. Overhead de retrabalho é horas. |
| "Não tem como demonstrar valor parcial" | Sempre tem. POST /recurso → 201 com 1 campo é entregável. |
| "Vou pular testes pra ir mais rápido" | Você não vai. Vai chegar no fim sem cobertura e rezar. |
| "Já planejei tudo, não preciso de checkpoints" | Plano é teoria. Implementação acha buracos. Checkpoints pegam cedo. |
| "Mudar de plano no meio é falha" | Mudar de plano quando o mundo muda é inteligência. |

## Red Flags

- Fatia sem teste (mesmo que parcial)
- Commit sem rodar suite de testes antes
- Mais de 300 linhas numa única fatia
- Demo de progresso que não funciona (fatiou errado)
- Tarefas marcadas `[P]` que acabam dependendo uma da outra
- PR com 1000+ linhas (refatorar fatiamento)
- Tempo de execução da fatia > 1 dia

## Verificação

- [ ] Cada fatia tem teste que prova funcionamento
- [ ] Cada fatia tem commit com mensagem rastreável (`feat(<domínio>): T-XX descrição`)
- [ ] Cada fatia termina com `npm test` + `npm run test:cov` passando
- [ ] `tasks.md` atualizado a cada fatia
- [ ] Próxima fatia identificada antes de fechar a anterior
- [ ] Se a fatia revelar issue de design, skill de domínio foi atualizada
