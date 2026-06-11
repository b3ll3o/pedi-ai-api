---
name: testing-patterns
description: Padrões e anti-padrões de teste. Carregue quando persona `test-engineer` identificar gap, ou antes de escrever suite de testes nova.
---

# Padrões de Teste

## Pirâmide de Testes

| Camada | % | Custo | Quando | Ferramenta PediAI |
|--------|---|-------|--------|------------------|
| **Unitário** | ~80% | Baixo | Toda entidade, VO, service, use case | Jest (api, app) |
| **Integração** | ~15% | Médio | Repositórios, controllers, componentes com deps | Jest + supertest (api), Testing Library (app) |
| **E2E** | ~5% | Alto | Fluxos críticos de usuário | Playwright (e2e project) |

**Regra:** quanto mais perto do domínio, mais unitário. Quanto mais perto do usuário, mais E2E.

## Ciclo TDD

```
🔴 RED     — Escreva teste que falha
🟢 GREEN   — Código mínimo para passar
🔵 REFACTOR — Limpe mantendo verde
(repita)
```

## Padrões PediAI

### Localização de Testes

| Subprojeto | Padrão | Convenção |
|------------|--------|-----------|
| `pedi-ai-api` | `*.spec.ts` co-localizado | `src/restaurante/restaurante.entity.spec.ts` |
| `pedi-ai-api` (E2E) | `test/*.e2e-spec.ts` | `test/restaurantes.e2e-spec.ts` |
| `pedi-ai-app` | `__tests__/` ao lado | `src/components/ui/__tests__/Button.test.tsx` |
| `pedi-ai-e2e` (Playwright) | `tests/{api,ui}/*.spec.ts` | `tests/api/restaurantes.spec.ts` |

### Nomes Descritivos

```typescript
// ❌ Ruim
test('test 1', () => { ... });
test('cnpj', () => { ... });

// ✅ Bom
it('deve criar restaurante com CNPJ válido', () => { ... });
it('deve lançar CNPJInvalidoError quando CNPJ tem dígitos verificadores errados', () => { ... });
```

### Estrutura AAA / Given-When-Then

```typescript
it('deve retornar 404 quando restaurante não existe', async () => {
  // Arrange (Given)
  const useCase = new BuscarRestaurantePorIdUseCase(mockRepo);
  
  // Act (When)
  const result = await useCase.execute('id-inexistente');
  
  // Assert (Then)
  expect(result).toBeNull();
});
```

## Anti-Patterns Comuns

| Anti-pattern | Por que é ruim | Correção |
|--------------|----------------|----------|
| Testar implementação (mock excessivo) | Teste quebra com refactor | Testar comportamento (entrada/saída) |
| Teste depende de ordem | Frágil | Isolamento: setup/teardown próprio |
| `waitForTimeout` / `sleep` | Flaky | Mock tempo, polling explícito, fixtures |
| Coverage 100% artificial | Linhas ≠ comportamento | Focar em branch coverage |
| Teste que testa framework | Tempo perdido | Teste SUA lógica |
| Snapshot excessivo | Aceita mudanças cegamente | Snapshot só dados estáveis |
| Mock de tudo | Testa mock, não código | Mock só o que é I/O externo |
| Sem teste de erro | Cobertura de happy path só | Cobrir 400, 401, 404, 409, 500 |
| Cobertura < 80% | Sem garantia mínima | Aumentar até o threshold |

## Pattern "Prove-It" para Bug Fixes

```typescript
// 1. Escreva o teste que REPRODUZ o bug
it('deve impedir criar restaurante com CNPJ "00.000.000/0000-00"', async () => {
  // 2. Confirme que falha ANTES do fix
  await expect(useCase.execute(dtoInvalido)).rejects.toThrow(CNPJInvalidoError);
  // 3. Aplique o fix
  // 4. Confirme que passa DEPOIS
});
```

## Mock de Dependências Externas

```typescript
// Mock de Prisma (em testes de use case)
const mockRepo: IRestaurantesRepository = {
  create: jest.fn().mockResolvedValue(mockRestaurante),
  findAll: jest.fn().mockResolvedValue([mockRestaurante]),
  // ...
};

// Mock de fetch (em testes de api client)
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: mockData }),
});
```

## Cobertura

**PediAI exige ≥ 80% em:**
- statements
- branches
- functions
- lines

**Excluídos (configurados em `jest.config`):**
- `*.module.ts`
- `index.ts`
- `*.entity.ts` (apenas estrutura)
- `main.ts`
- `app.module.ts`
- `presentation/auth/guards/**`

## Checklist Pré-Merge (Testes)

- [ ] Todo novo código tem teste correspondente
- [ ] Teste escrito ANTES do código (TDD)
- [ ] Cobertura ≥ 80% mantida
- [ ] Testes de caminho feliz E caminho de erro
- [ ] Edge cases cobertos (null, vazio, boundary)
- [ ] Sem `xit` / `.skip`
- [ ] Nomes descritivos
- [ ] Sem `waitForTimeout` em testes Playwright
- [ ] Suite roda em < 30s (unit) e < 5min (E2E)
