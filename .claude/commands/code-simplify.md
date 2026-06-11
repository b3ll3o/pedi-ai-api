---
name: code-simplify
description: Simplifica código para clareza. Ativa `code-simplification` para refatorar com segurança. Use após implementação, antes de merge, ou em cleanup periódico.
---

# /code-simplify — Simplificar Código

**Argumentos opcionais:** caminho de arquivo, diretório, ou nome de skill de domínio.

## O que este comando faz

1. Identifica o código a simplificar (arquivo, módulo, ou diff)
2. Aplica `code-simplification`:
   - Lê sem mexer
   - Identifica complexidade (funções longas, duplicação, comentários redundantes)
   - Aplica transformações incrementais (1 a 1)
   - Valida testes entre cada
3. Reporta o que mudou e o que ficou

## Skills ativadas

- `using-agent-skills`
- `code-simplification`

## Pré-condição

- Código existe e está funcionando (testes passam)
- Se ainda em desenvolvimento, termine a feature primeiro

## Etapas

1. **Identifique o escopo:**
   - Por argumento: arquivo ou diretório
   - Default: mudanças pendentes (`git diff`)

2. **Confirme que testes passam antes de começar:**
   ```bash
   npm test
   ```

3. **Leia o código sem mexer** — observe:
   - Funções > 50 linhas
   - Nomes genéricos (`temp`, `data`, `result`)
   - If/else aninhado > 3 níveis
   - Duplicação visível
   - Comentários que repetem o código
   - Números mágicos
   - Flags booleanas em parâmetros

4. **Aplique transformações incrementalmente** (1 por vez):
   - Extraia método
   - Renomeie
   - Substitua flag por método
   - Substitua número mágico por constante
   - Substitua condicional aninhado por early return
   - Remova código morto
   - Remova comentários redundantes

5. **Após cada transformação:**
   ```bash
   npm test
   ```
   - Se passou, próxima
   - Se quebrou, reverta

6. **Reporte:**

   ```markdown
   ## Simplificação: <escopo>

   ### Transformações aplicadas
   - T-01: Extraiu `validarCnpj` de `CriarRestauranteUseCase`
   - T-02: Renomeou `data` para `restauranteData` em `RestauranteForm`
   - T-03: Substituiu if/else aninhado por early return em `AuthService.login`
   - T-04: Removeu 3 comentários redundantes
   - T-05: Extraiu constante `MAX_TENTATIVAS_LOGIN = 5`

   ### Antes vs Depois
   - Função mais longa: 87 linhas → 42 linhas
   - Comentários redundantes: 12 → 0
   - Duplicação removida: 2 instâncias

   ### Verificação
   - ✅ Testes passam
   - ✅ Coverage mantida (87% → 87%)
   - ✅ Comportamento idêntico
   ```

7. **Pause para revisão:**
   - Se OK, commit com `refactor(<domínio>): <descrição>`
   - Se não, reverta com `git checkout`

## Quando NÃO Usar

- Código em desenvolvimento ativo (estabilize primeiro)
- Performance crítica medida (use `/review performance` em vez disso)
- Quando "simplificar" é pretexto para reescrita (escopo: transformações pequenas)

## Saída esperada

- Código mais legível
- Comportamento idêntico
- Testes passando
- Coverage mantida
- Commit de refactor

## Exemplo

```
Usuário: /code-simplify src/restaurante/

Agente: Lendo código de src/restaurante/...

Identifiquei:
- CriarRestauranteUseCase tem 87 linhas (3 responsabilidades)
- 5 comentários que repetem o código
- 2 constantes mágicas (100, 14)

Aplicando transformações:
- T-01: Extrair validarCnpj() — 87 → 65 linhas
- T-02: Extrair validarHorarios() — 65 → 48 linhas
- T-03: Remover 5 comentários redundantes
- T-04: Extrair MAX_NOME_LENGTH e CNPJ_LENGTH

✅ Testes: 24/24 passam
✅ Coverage: 87% mantida
✅ Lint: sem erros
✅ Type-check: sem erros

Commit: refactor(restaurante): simplificar CriarRestauranteUseCase (extrair validações)
```
