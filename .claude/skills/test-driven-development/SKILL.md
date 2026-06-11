---
name: test-driven-development
description: Desenvolvimento orientado por testes. Use ao implementar qualquer lógica, corrigir bug, ou mudar comportamento. Use quando precisar provar que o código funciona, ou quando estiver prestes a modificar funcionalidade existente.
---

# Desenvolvimento Orientado por Testes (TDD)

## Visão Geral

TDD inverte a ordem natural: **escreva o teste primeiro, faça-o passar, depois refatore**. Isso força a pensar no contrato antes da implementação, garante cobertura por construção, e produz testes que documentam comportamento (não implementação). PediAI exige ≥ 80% de cobertura — TDD torna isso natural em vez de doloroso.

## Quando Usar

- Ao implementar qualquer lógica de domínio, use case, ou controller
- Ao corrigir qualquer bug (criar teste de regressão ANTES do fix)
- Ao mudar comportamento de código existente
- Ao adicionar novo endpoint ou rota
- Antes de declarar uma tarefa como "pronta"

## O Ciclo TDD

```
🔴 RED:   Escreva um teste que falha
🟢 GREEN: Escreva o código mínimo para passar
🔵 REFACTOR: Limpe a implementação mantendo testes verdes
(repita)
```

### 🔴 RED — Escreva o teste que falha

1. Identifique o comportamento a testar (1 teste = 1 comportamento)
2. Escreva o teste ANTES do código de produção
3. Confirme que o teste **falha pelo motivo certo** (não por typo ou import errado)
4. Nome do teste descreve o comportamento: `deve retornar 404 quando restaurante não existe`

### 🟢 GREEN — Código mínimo para passar

1. Escreva o código mais simples que faz o teste passar
2. **Não** adicione código extra "antecipando" features
3. Se o teste passar, vá para refactor
4. Resistir à tentação de "aproveitar e fazer mais coisas"

### 🔵 REFACTOR — Limpar

1. Elimine duplicação
2. Melhore nomes
3. Extraia métodos/classes
4. Mantenha testes verdes durante todo o refactor
5. Rode testes após cada mudança

## Pattern "Prove-It" para Bug Fixes

Ao corrigir bug, o teste vem ANTES:

1. **Reproduza o bug** com um teste que falha (escreva a asserção que reproduz o bug)
2. **Confirme que o teste falha** (prova que o teste captura o problema)
3. **Corrija o código de produção** até o teste passar
4. **Adicione testes adjacentes** (edge cases próximos ao bug)

Sem esse pattern, o "fix" pode estar testando outra coisa.

## Pirâmide de Testes

| Camada | % | Custo | Quando |
|--------|---|-------|--------|
| Unitário | ~80% | Baixo | Toda entidade, VO, service, use case |
| Integração | ~15% | Médio | Repositórios Prisma, controllers |
| E2E | ~5% | Alto | Fluxos críticos via Playwright (pedi-ai-e2e) |

**Regra:** quanto mais perto do domínio, mais unitário. Quanto mais perto do usuário, mais E2E.

## Padrões PediAI

| Camada | Framework | Localização | Comando |
|--------|-----------|-------------|---------|
| Unit (api) | Jest 29 + ts-jest | `src/**/*.spec.ts` (co-located) | `npm test` |
| E2E (api) | Jest + supertest | `test/*.e2e-spec.ts` | `npm run test:e2e` |
| Unit (app) | Jest 30 + Testing Library | `__tests__/` ao lado do código | `npm test` |
| E2E (e2e) | Playwright | `tests/{api,ui}/*.spec.ts` | `npm run test:api`, `npm run test:ui` |

## Escrevendo Bons Testes

- **Nome descritivo**: `deve retornar 400 quando CNPJ é inválido` (não `test1`)
- **Arrange-Act-Assert** (AAA) ou **Given-When-Then** (BDD)
- **DAMP > DRY em testes** (repetição > abstração — legibilidade > economia)
- **1 comportamento por teste** (não combine asserções sem relação)
- **Teste estado, não interação** (assert sobre o resultado, não sobre o que foi chamado)
- **Sem `sleep` / `waitForTimeout`** em testes (use mocks, fixtures, ou polling explícito)

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Vou escrever testes depois que o código funcionar" | Você não vai. E testes depois testam implementação, não comportamento. |
| "É simples demais para testar" | Código simples fica complicado. O teste documenta o comportamento esperado. |
| "Testes me atrasam" | Testes atrasam agora. Aceleram toda mudança futura. |
| "Testei manualmente" | Teste manual não persiste. Mudança de amanhã quebra sem aviso. |
| "O código é autoexplicativo" | Testes SÃO a especificação. Documentam o que deveria fazer, não o que faz. |
| "É só um protótipo" | Protótipos viram produção. Testes do dia 1 evitam crise de test debt. |
| "Vou rodar o teste de novo para ter certeza" | Run limpa + sem mudança no código = informação zero. Rode após edits, não por insegurança. |

## Red Flags

- Código de produção sem teste correspondente
- Teste que passa no primeiro run (pode não estar testando o que você pensa)
- "Todos os testes passam" mas nenhum teste foi rodado de fato
- Bug fix sem teste de regressão
- Teste que testa framework (ex: "Prisma salva no banco") em vez de comportamento
- Nome de teste que não descreve o comportamento esperado
- Teste pulado (`xit`, `.skip`) para fazer suite passar
- Rodar mesmo comando de teste 2x seguidas sem mudança no código

## Verificação

- [ ] Todo comportamento novo tem teste escrito ANTES do código
- [ ] Todo bug fix tem teste de regressão
- [ ] Todos os testes passam via `npm test`
- [ ] Coverage ≥ 80% (statements, branches, functions, lines)
- [ ] Nomes de testes são descritivos do comportamento
- [ ] Nenhum teste pulado
- [ ] Coverage não caiu em relação à main
- [ ] Refactorings mantêm testes verdes
