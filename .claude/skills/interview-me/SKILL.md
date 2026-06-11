---
name: interview-me
description: Conduz entrevista iterativa para autoavaliação, exploração de problema, ou descoberta de requisitos. Use quando o escopo é grande e incerto, ou quando precisa elicit conhecimento do usuário.
---

# Interview Me

## Visão Geral

Algumas decisões de design são melhores elicitadas do que assumidas. Esta skill faz o agente entrevistar o usuário com perguntas estruturadas, ao invés de assumir. Use quando o problema é grande e/ou ambíguo, e o custo de assumir errado é alto.

## Quando Usar

- Spec nova em domínio desconhecido
- Feature que cruza múltiplos domínios
- Quando a primeira resposta do usuário é curta ou vaga
- Quando você não tem contexto de negócio
- Antes de `idea-refine` em problemas complexos
- Quando há stakeholders diferentes com visões diferentes

## Quando NÃO Usar

- Pedido claro e específico
- Bug fix com repro definido
- Mudança trivial
- Quando o tempo é crítico (hotfix)

## Processo

### 1. Abertura

Comece explicando o que você quer entender e por quê:

"Vou fazer algumas perguntas para entender o problema antes de propor solução. Pode responder no nível de detalhe que quiser."

### 2. Perguntas em camadas

**Não despeje 10 perguntas de uma vez.** Vá em camadas:

1. **Contexto** (1-2 perguntas): "Qual problema estamos resolvendo?" "Quem é afetado?"
2. **Comportamento esperado** (2-3 perguntas): "O que deveria acontecer quando...?" "O que NÃO deveria acontecer?"
3. **Restrições** (1-2 perguntas): "Há prazo?" "Há dependência de X?"
4. **Trade-offs** (1-2 perguntas): "Preferiria X simples ou Y mais robusto?" "Performance ou clareza?"

### 3. Adapte conforme respostas

Cada resposta pode levar a nova pergunta (follow-up). Se algo não ficou claro, peça clarificação com exemplo.

### 4. Resuma e confirme

Ao final, resuma o que entendeu:

"Entendi: <resumo>. Correto? Falta algo importante?"

### 5. Decida o próximo passo

- ✅ Suficiente para spec → `spec-driven-development`
- 🔄 Precisa aprofundar → continue entrevistando
- ⏸️ Adiar → anote contexto para depois

## Tipos de Perguntas

| Tipo | Quando | Exemplo |
|------|--------|---------|
| **Aberta** | Elicitar contexto amplo | "Descreva o fluxo atual de..." |
| **Fechada** | Confirmar hipótese | "O usuário pode fazer isso? (s/n)" |
| **Cenário** | Comportamento esperado | "Se o cliente enviar X, o sistema deveria..." |
| **Trade-off** | Decisão de design | "Performance ou legibilidade do código?" |
| **Hipotética** | Edge case | "E se o input for vazio?" |
| **Anti-exemplo** | O que NÃO fazer | "Tem algum cenário que definitivamente NÃO deveria acontecer?" |

## Princípios

- **Uma pergunta por vez** (não multi-choice empilhadas)
- **Sem jargão** (pergunte em linguagem de negócio)
- **Não assuma** (mesmo que pareça óbvio)
- **Confirme entendimento** periodicamente
- **Documente** as respostas para a spec

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Já sei o suficiente" | Sabe o suficiente pra começar. Não pra terminar. |
| "Entrevistar é demorado" | Demora 15 min. Refazer custa 1 dia. |
| "Usuário não tem tempo" | 5 perguntas focadas tomam 5 min. Bug em prod toma 5 horas. |
| "Vou inferir do código existente" | Código diz o que está, não o que deveria. |
| "Pergunta retórica" | Se é retórica, não é entrevista. Pergunte de verdade. |

## Red Flags

- Aceitar resposta vaga sem follow-up
- 10 perguntas de uma vez (paralisia)
- Pular a confirmação final
- Misturar perguntas abertas e fechadas caoticamente
- Assumir resposta (interpretar em vez de perguntar)
- "Decidir pelo usuário" sem flag explícito
- Entrevista sem documentação posterior

## Verificação

- [ ] Abertura explicou objetivo da entrevista
- [ ] Perguntas em camadas (não despejo)
- [ ] Tipo certo de pergunta por momento
- [ ] Confirmação final do entendimento
- [ ] Próximo passo decidido (spec, aprofundar, adiar)
- [ ] Respostas documentadas (vão para spec)
