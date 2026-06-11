---
name: code-simplification
description: Simplifica e refatora código para clareza. Use após implementação estar funcionando, antes de merge, ou em sessões de cleanup. Use quando código está complexo demais para o que faz.
---

# Simplificação de Código

## Visão Geral

Clareza vence esperteza. Código simples é mais fácil de manter, debugar, e evoluir. Esta skill guia um processo de simplificação: **ler → identificar complexidade → simplificar → verificar comportamento idêntico**.

## Quando Usar

- Após implementação funcionar e testes passarem
- Antes de merge, como auto-revisão
- Em sessões periódicas de cleanup
- Quando código está difícil de entender
- Quando há duplicação visível
- Quando uma função tem > 50 linhas

## Quando NÃO Usar

- Código ainda em desenvolvimento (otimize após estabilizar)
- Performance crítica medida (use `performance-optimization`)
- Quando "simplificar" significa "mover problema para outro lugar"

## Processo

### 1. LER sem julgamento

- Leia o código como se fosse de outra pessoa
- Não mexa ainda — só observe
- Anote o que está confuso, verboso, ou duplicado

### 2. IDENTIFICAR complexidade

Procure por:

| Sinal de complexidade | Exemplo |
|----------------------|---------|
| Função > 50 linhas | Helper que faz 5 coisas |
| Nomes genéricos | `temp`, `data`, `result`, `helper` |
| Comentários explicando o que (não por que) | `// incrementa i` antes de `i++` |
| If/else aninhado > 3 níveis | Lógica de validação em pirâmide |
| Duplicação óbvia | Mesma transformação em 3 lugares |
| Abstração prematura | Interface com 1 implementação |
| Números mágicos | `if (size > 1024)` sem constante |
| Flag booleano em parâmetro | `save(user, true)` — o que é `true`? |

### 3. SIMPLIFICAR incrementalmente

**Aplique transformações 1 a 1, validando testes entre cada:**

1. **Extraia método** quando uma função faz mais de 1 coisa
2. **Renomeie** quando nome não diz o que é
3. **Substitua flag por método** quando bool é parâmetro
4. **Substitua número mágico por constante nomeada**
5. **Substitua condicional aninhado por early return** (guard clauses)
6. **Extraia constante** para literais repetidos
7. **Remova comentário** que apenas repete o código
8. **Remova código morto** (variável não usada, função órfã, `// removed`)
9. **Inverta condição** quando simplifica a leitura

**Após cada transformação:**
- Rode teste
- Se passou, próxima transformação
- Se quebrou, reverte e tente de outra forma

### 4. VERIFICAR comportamento idêntico

**A simplificação não pode mudar comportamento.**

- Testes existentes DEVEM continuar passando
- Coverage não pode cair
- Output idêntico para os mesmos inputs
- Performance não pode regredir significativamente

## Princípios

- **DRY quando a abstração é clara.** Se você precisa explicar a abstração, ela é prematura.
- **Não generalize até o 3º caso de uso.** YAGNI.
- **Nomes descritivos > comentários.** `isUserAdmin` em vez de `// verifica se é admin`.
- **Funções curtas.** Se cabe na tela, cabe na cabeça.
- **Composição > herança** em OO.
- **Dados > código.** Configuração em JSON > código procedural.

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Está claro pra mim, não precisa simplificar" | Você escreveu. Outra pessoa (ou você em 6 meses) não vai achar claro. |
| "Simplificar = reescrever" | Simplificar é transformações pequenas com testes. Reescrita é big bang. |
| "Vou esperar pra ver se vira problema" | Complexidade vira problema sempre. Custa mais corrigir depois. |
| "Performance é mais importante" | Performance medida é. Complexidade por antecipação é cara. |
| "Tem cobertura, não precisa simplificar" | Cobertura mede linhas executadas, não complexidade ciclomática. |

## Red Flags

- Simplificação que muda comportamento
- "Simplificação" que move código sem reduzir complexidade
- Reescrita de módulo inteiro numa sessão
- Remoção de código sem confirmar que é morto
- Mudança em testes junto com simplificação (se testes mudam, não é só simplificação)
- Performance regredindo sem validação

## Verificação

- [ ] Cada transformação rodada de forma incremental
- [ ] Testes passam após cada transformação
- [ ] Coverage mantido em ≥ 80%
- [ ] Comportamento idêntico (mesmos outputs para mesmos inputs)
- [ ] Performance não regrediu (ou melhoria marginal)
- [ ] Nenhum comentário agora explica "o que" (só "por que")
- [ ] Nenhuma função > 50 linhas após simplificação
- [ ] Lint passa, type-check passa
