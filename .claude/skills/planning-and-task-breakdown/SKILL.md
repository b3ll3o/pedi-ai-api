---
name: planning-and-task-breakdown
description: Planeja o trabalho e quebra em tarefas. Use após `spec-driven-development` produzir uma spec, antes de começar a implementar. Use quando precisar estimar, paralelizar, ou sequenciar trabalho.
---

# Planejamento e Decomposição de Tarefas

## Visão Geral

Uma spec bem escrita define o destino. Esta skill define a rota — quebrando o trabalho em tarefas pequenas, ordenadas, verificáveis, e com critérios de pronto explícitos. O resultado é um `tasks.md` que serve como roteiro de implementação e checklist de progresso.

## Quando Usar

- Imediatamente após criar/atualizar uma skill de domínio com spec-driven-development
- Quando o trabalho envolve ≥ 3 arquivos a modificar
- Antes de começar implementação de feature standard/major (per PediAI workflow)
- Quando paralelização faz sentido (multi-arquivo, multi-equipe)
- Antes de estimar prazo

## Processo

1. **Leia a skill de domínio** que está sendo implementada
   - Extraia RFs, RNFs, e Critérios de Aceitação
   - Esses são os "entregáveis" — cada um vira pelo menos 1 tarefa

2. **Quebre por fatia vertical (vertical slicing)**
   - Cada tarefa deve entregar valor de ponta a ponta: API + DB + UI + teste
   - Evite tarefas "horizontais" (ex: "criar todas as entidades" → ruim; "criar restaurante + listar + testar" → bom)
   - Ideal: 1-3 RFs por tarefa

3. **Defina a ordem de dependência**
   - Foundation primeiro (entidades, repositórios, validações)
   - Casos de uso por cima
   - Controllers/exposição por último
   - Testes podem ser escritos em paralelo (TDD: teste antes do código)

4. **Escreva cada tarefa com estrutura fixa:**
   - **ID**: `T-XX` (sequencial)
   - **Título**: frase imperativa curta
   - **Arquivo(s)**: paths exatos a modificar
   - **Critério de pronto**: como saber que terminou
   - **Dependências**: quais T-XX precisam estar prontas antes

5. **Marque a estratégia de testes por tarefa**
   - Unitário, integração, ou E2E
   - PediAI exige ≥ 80% coverage — tarefa sem teste não está pronta

6. **Valide o tamanho**
   - ~100 linhas: bom (cabe numa sessão)
   - ~300 linhas: aceitável para mudança lógica única
   - ~1000 linhas: grande demais — quebrar

7. **Identifique tarefas paralelizáveis**
   - Marque como `[P]` (parallel) tarefas sem dependência entre si
   - Útil para dividir entre subagents do Claude Code

8. **Escreva o `tasks.md`** com seções agrupadas por área (entidade, use case, controller, teste)

## Exemplo de Tarefa

```markdown
- [ ] **T-05**: Criar entidade Restaurante com validação de CNPJ
  - **Arquivo**: `src/restaurante/domain/entities/restaurante.entity.ts`
  - **Critério de pronto**: 
    - [ ] Valida formato de CNPJ (14 dígitos, dígitos verificadores)
    - [ ] Lança `CNPJInvalidoError` se inválido
    - [ ] Teste unitário cobrindo CNPJ válido, inválido, edge cases
  - **Dependências**: nenhuma
  - **Teste**: unitário
```

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "É uma tarefa só, não preciso quebrar" | Tarefa "única" de 1000 linhas vira semana de trabalho sem checkpoint. |
| "Vou planejar mentalmente, não preciso escrever" | Memória tem 7±2 itens. Tarefas além disso viram bug. |
| "O plano vai mudar mesmo, então não vale a pena" | Plano que muda é sinal de aprendizado. Sem plano, não há o que mudar. |
| "Tarefas pequenas demais = overhead" | Tarefas pequenas = checkpoints frequentes = bugs achados cedo. |
| "Tarefa sem critério de pronto está óbvia" | Óbvio pra quem escreveu, opaco pra quem vai implementar. |
| "Não preciso estimar" | Sem estimativa, sem prazo. Sem prazo, sem prioridade. |

## Red Flags

- Tarefa com mais de 5 bullets no critério de pronto (deveria ser quebrada)
- Tarefa sem critério de pronto mensurável
- Tarefa com dependência circular
- Tarefa com 0 testes associados
- `tasks.md` com mais de 50 tarefas (refinar — agrupar ou cortar escopo)
- Tarefa "horizontal" (ex: "configurar Prisma", "criar todas as migrations")
- Tarefa sem path de arquivo específico ("ajustar lógica" não é tarefa)
- Tarefa cuja descrição não cabe em 1 linha

## Verificação

- [ ] `tasks.md` criado dentro da skill de domínio (`tasks.md` na mesma pasta)
- [ ] Cada tarefa tem: ID, título, arquivo(s), critério de pronto, dependências, tipo de teste
- [ ] Tarefas ordenadas por dependência
- [ ] Tarefas paralelizáveis marcadas com `[P]`
- [ ] Cada RF tem pelo menos 1 tarefa que a implementa
- [ ] Cada RNF tem tarefa explícita (cobertura, performance, etc)
- [ ] Nenhuma tarefa > 300 linhas estimadas
- [ ] `tasks.md` revisado antes de iniciar implementação
