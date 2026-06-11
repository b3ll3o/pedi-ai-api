---
name: plan
description: Planeja como construir. Ativa `planning-and-task-breakdown` para quebrar o trabalho em tarefas pequenas, ordenadas, verificáveis. Use após `/spec` ou quando precisar estimar/paralelizar.
---

# /plan — Planejar Como Construir

**Argumentos opcionais:** nome do domínio (usa a skill ativa se omitido).

## O que este comando faz

1. Carrega a **skill de domínio** (a mais recentemente editada ou a especificada)
2. Aplica `planning-and-task-breakdown`:
   - Quebra por fatia vertical (cada tarefa entrega valor de ponta a ponta)
   - Define ordem de dependência
   - Marca tarefas paralelizáveis com `[P]`
   - Define critério de pronto para cada tarefa
3. Cria/atualiza `tasks.md` dentro da pasta da skill de domínio

## Skills ativadas

- `using-agent-skills`
- `planning-and-task-breakdown`

## Pré-condição

- Spec deve existir (criada por `/spec` ou manualmente)
- Se não existir, redirecione para `/spec` primeiro

## Etapas

1. **Identifique a spec alvo:**
   - Por argumento (`/plan restaurante`)
   - Por contexto de conversa
   - Por `git diff` (mudanças pendentes)

2. **Leia a skill de domínio** e extraia:
   - RFs (cada um vira ≥ 1 tarefa)
   - RNFs (cada um vira tarefa explícita — coverage, performance)
   - Critérios de aceitação (definem "pronto")

3. **Aplique `planning-and-task-breakdown`:**
   - Quebre em fatias verticais pequenas (~100-300 linhas cada)
   - Ordene por dependência
   - Marque `[P]` onde paralelizável
   - Cada tarefa tem: ID, título, arquivo(s), critério de pronto, dependências, tipo de teste

4. **Valide:**
   - Cada RF tem ≥ 1 tarefa
   - Cada RNF tem tarefa explícita
   - Nenhuma tarefa > 300 linhas
   - Critérios de pronto mensuráveis

5. **Confirme com o usuário:**
   - "Tasks criadas em `.claude/skills/<domínio>/tasks.md`. N total, M paralelizáveis. Iniciar com /build?"

## Saída esperada

- `tasks.md` criado/atualizado em `.claude/skills/<domínio>/`
- Resumo: total de tarefas, quantas paralelizáveis, primeira tarefa

## Exemplo

```
Usuário: /plan restaurante

Agente: Lendo skill de domínio `restaurante`. 7 RFs + 3 RNFs.

Vou quebrar em 5 fatias verticais:

1. Fundação (T-01 a T-04): entidade Restaurante, validação de CNPJ, repository Prisma
2. Criar (T-05 a T-08): CriarRestauranteUseCase + POST /restaurants
3. Listar/Buscar (T-09 a T-12): GET /restaurants, GET /:id
4. Atualizar (T-13 a T-15): PATCH /restaurants/:id
5. Soft delete (T-16 a T-18): DELETE /restaurants/:id

T-08 e T-09 são paralelizáveis ([P]).

[escreve tasks.md]

18 tarefas, 2 paralelizáveis. Primeira: T-01 (entidade). /build?
```
