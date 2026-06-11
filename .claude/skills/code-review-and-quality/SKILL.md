---
name: code-review-and-quality
description: Conduz revisão de código multi-eixo. Use antes de fazer merge, ao revisar código seu, de outro agente, ou humano. Use para avaliar qualidade antes de entrar na main.
---

# Revisão de Código e Qualidade

## Visão Geral

Revisão multi-dimensional com gates de qualidade. Cobre **5 eixos**: corretude, legibilidade, arquitetura, segurança e performance. O padrão de aprovação é: o código "definitivamente melhora a saúde geral do código, mesmo não sendo perfeito". Código perfeito não existe — o objetivo é melhoria contínua.

## Quando Usar

- Antes de fazer merge de qualquer PR ou mudança
- Após completar implementação de feature
- Ao revisar código gerado por outro agente ou modelo
- Ao refatorar código existente
- Após qualquer bug fix

## Os 5 Eixos de Revisão

### 1. Corretude

- Bate com a spec? (RF, RNF, critérios de aceitação)
- Trata edge cases (null, vazio, boundary, unicode, overflow)
- Cobre caminhos de erro (não só happy path)
- Garante que testes verificam o **comportamento** (não a implementação)
- Atenção a off-by-one, race conditions, mutação concorrente
- Prisma: usa transações quando precisa atomicidade?

### 2. Legibilidade & Simplicidade

- Nomes descritivos e consistentes (sem `temp`, `data`, `result` soltos)
- Fluxo de controle direto (sem `if` aninhado profundo)
- Organização lógica (entidades primeiro, agregados, use cases)
- Sem "truques espertos" — "Isso poderia ser feito em menos linhas?"
- Abstrações **ganham** complexidade — "Não generalize até o 3º caso de uso"
- Sem código morto (variáveis não usadas, shims de compat, `// removed`)

### 3. Arquitetura

- Aderência aos padrões DDD do PediAI (ver CLAUDE.md do subprojeto)
- Boundaries de módulo limpos (domain não toca Prisma, etc)
- Sem duplicação (DRY quando a abstração é clara)
- Sem dependência circular
- Nível de abstração apropriado (não super-engenharia)
- `infrastructure` conhece `domain`, nunca o contrário

### 4. Segurança

- Valida input do usuário (DTOs com class-validator)
- Secrets fora do código/logs (env vars, nunca hardcoded)
- SQL parametrizado (Prisma por padrão; cuidado com `raw` queries)
- Outputs encodados (sem XSS em templates Next.js)
- Dependências auditadas (`npm audit`)
- Dados externos tratados como não-confiáveis
- Validação em fronteiras do sistema (controllers, parsers)

### 5. Performance

- N+1 queries em loops (usar `include` ou batch)
- Loops sem limite (`for` infinito, `while` que nunca termina)
- Operações sync que deveriam ser async (I/O bloqueante)
- Re-renders desnecessários no Next.js (useMemo, useCallback quando aplicável)
- Falta de paginação em listagens (`take` + `skip` no Prisma)
- Objetos grandes em hot path
- Falta de índices em colunas filtradas

## Tamanho da Mudança

| Tamanho | Diretriz |
|---------|----------|
| ~100 linhas | Bom — revisável numa sessão |
| ~300 linhas | Aceitável para mudança lógica única |
| ~1000 linhas | Grande demais — quebrar |

**Estratégias para quebrar:** Stack (em fases), por grupo de arquivo, horizontal (shared code primeiro), vertical (full-stack slices).

## Processo de Revisão (5 Passos)

1. **Entenda o Contexto** — intent, spec, comportamento esperado
2. **Revise Testes Primeiro** — cobertura, comportamento vs implementação, edge cases
3. **Revise Implementação** — passe pelos 5 eixos
4. **Categorize Findings** — severidade (ver tabela abaixo)
5. **Verifique a Verificação** — testes, build, checks manuais, screenshots

## Severidade dos Findings

| Prefixo | Significado | Ação do autor |
|---------|-------------|---------------|
| *(sem prefixo)* | Mudança obrigatória | Tratar antes do merge |
| **Crítico:** | Bloqueia merge | Segurança, perda de dados, funcionalidade quebrada |
| **Nit:** | Menor, opcional | Autor pode ignorar |
| **Opcional:** / **Considere:** | Sugestão | Não obrigatório |
| **FYI** | Informativo | Nenhuma ação |

## Revisão Multi-Modelo

Modelo A escreve → Modelo B revisa (corretude/arquitetura) → Modelo A endereça feedback → Humano decide. Modelos diferentes pegam pontos cegos diferentes. Em PediAI, isso é o pattern natural de Claude Code usando subagents.

## Higiene de Código Morto

Após refactors: identifique código não usado, liste explicitamente, **pergunte antes de deletar**. Nunca remova silenciosamente coisas das quais você não tem certeza.

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Funciona, está bom o suficiente" | Código funcionando mas ilegível, inseguro, ou arquiteturalmente errado cria dívida que cresce. |
| "Eu que escrevi, sei que está correto" | Autores são cegos aos próprios pressupostos. Toda mudança se beneficia de outro olhar. |
| "Vamos limpar depois" | "Depois" nunca vem. Review é o gate — use-o. |
| "Código de IA provavelmente está ok" | Código de IA precisa de mais escrutínio, não menos. É confiante e plausível, mesmo errado. |
| "Testes passam, está bom" | Testes são necessários mas não suficientes. Não pegam arquitetura, segurança, legibilidade. |
| "É mudança trivial" | Mudanças triviais em lugares errados causam incidentes. |

## Red Flags

- Merges sem review
- Reviews que dizem "testes passam" sem olhar o código
- LGTM sem evidência
- Mudanças de segurança sem review de segurança (use persona `security-auditor`)
- PRs > 1000 linhas
- Bug fix sem teste de regressão
- Comentários sem severidade
- Aceitar "limpar depois" sem ticket

## Verificação

- [ ] Todos os findings Críticos/Importantes resolvidos
- [ ] Testes passam (`npm test`)
- [ ] Build passa (`npm run build`)
- [ ] Coverage não caiu (`npm run test:cov`)
- [ ] Lint passa (`npm run lint`)
- [ ] TypeScript type-check passa (`npx tsc --noEmit`)
- [ ] Mudança < 1000 linhas (ou justificada se maior)
- [ ] Cada RF implementado tem teste
- [ ] Mudança aprovada por pelo menos 1 reviewer (ou persona)
