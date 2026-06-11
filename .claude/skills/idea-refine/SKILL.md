---
name: idea-refine
description: Refina e clarifica ideias antes de executar. Use quando o pedido é vago, há múltiplas interpretações, ou o escopo é incerto. Use antes de criar uma spec ou mudar feature.
---

# Refinamento de Ideias

## Visão Geral

A maioria dos pedidos começa vaga: "preciso de uma feature de busca", "vamos melhorar performance", "está lento". Antes de escrever spec ou quebrar tarefas, refine a ideia até ela ser executável. Esta skill guia esse processo: **capturar → clarificar → priorizar → decidir**.

## Quando Usar

- Pedido vago ou ambíguo
- Múltiplas interpretações possíveis
- Escopo incerto ("o que entra e o que não entra?")
- Antes de criar spec (`spec-driven-development`)
- Antes de estimar prazo
- Em conversa inicial sobre feature

## Quando NÃO Usar

- Pedido claro e específico
- Mudança trivial (1 linha)
- Bug fix com repro claro
- Hotfix

## Processo

### 1. CAPTURAR

Reformule o pedido em 1 frase:

```
Usuário pediu: "<pedido original>"
Reformulação: <1 frase com objetivo claro>
```

**Exemplo:**
- Pedido: "queria buscar usuários"
- Reformulação: "Permitir ADMIN buscar/listar usuários por nome ou email com paginação"

### 2. CLARIFICAR

Liste 3-5 perguntas cujas respostas eliminam ambiguidade. Use `interview-me` se o pedido for grande, ou pergunte diretamente se for curto.

| Dimensão | Perguntas típicas |
|----------|-------------------|
| **Quem** | Quem é o usuário? Qual perfil (ADMIN, USUARIO)? |
| **O quê** | Qual input? Qual output? Qual critério de sucesso? |
| **Quando** | Quando é acionado? Em que contexto? |
| **Onde** | Em qual superfície (API, UI, ambos)? |
| **Por que** | Qual problema resolve? Qual valor? |
| **Restrições** | Performance? Compatibilidade? Custo? |
| **Fora de escopo** | O que NÃO fazer? |

### 3. PRIORIZAR

Decida o que é MUST, SHOULD, COULD, WON'T (MoSCoW):

| Categoria | Definição | PediAI |
|-----------|-----------|--------|
| **MUST** | Sem isso, feature não funciona | RFs principais |
| **SHOULD** | Importante, mas pode adiar | RNFs secundários |
| **COULD** | Nice-to-have | Polimento, animações |
| **WON'T** | Explicitamente fora do escopo | "Não vamos fazer X" |

**Regra MVP:** corte SHOULD/COULD na primeira versão. Releia a regra depois de 1 semana.

### 4. DECIDIR

Saídas possíveis:
- ✅ **Pronto para spec** — vá para `spec-driven-development`
- 🔄 **Precisa de mais info** — volte para CLARIFICAR
- ⏸️ **Adiar** — não é prioridade, volte mais tarde
- ❌ **Rejeitar** — não faz sentido para PediAI (documente por quê)

## Exemplo Aplicado

```markdown
PEDIDO: "queria ter notificações de pedido"

CAPTURAR:
"Enviar notificação ao restaurante quando novo pedido é feito"

CLARIFICAR:
- Quem envia? Sistema ou restaurante?
- Qual canal? Email, push, SMS?
- Quando exatamente? Ao criar pedido? Ao confirmar?
- O restaurante pode desabilitar?
- Qual volume esperado?

PRIORIZAR (MoSCoW):
- MUST: salvar notificação no banco; exibir lista no painel
- SHOULD: marcar como lida; tempo desde criação
- COULD: email transacional
- WON'T: push notifications, SMS, tempo real

DECIDIR: ✅ Pronto para spec — criar skill de domínio `notificacao`
```

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Já entendi, vou direto pra spec" | Entendimento implícito vira spec ambíguo. Explicitar força decisões. |
| "Perguntar é overhead" | Overhead de 5 min economiza 1 dia de retrabalho. |
| "MVP é fazer só o básico" | MVP é fazer o que importa, não fazer sem pensar. Refinar ≠ implementar. |
| "O usuário não sabe o que quer" | A gente também não. Refinamento é processo conjunto. |
| "Adicionar tudo é melhor" | Adicionar tudo = entregar nada. Priorizar é o trabalho. |
| "Decidir depois é mais flexível" | Decidir depois acumula. Decidir agora ancora. |

## Red Flags

- Pedido aceito sem clarificação
- "WON'T" não explicitado (escopo vira bola de neve)
- Tudo marcado como MUST (sem priorização real)
- Spec escrita com MoSCoW=incerto
- Pedido com 5 objetivos (perde foco)
- "Vou adicionar enquanto implemento" (scope creep)

## Verificação

- [ ] Pedido capturado em 1 frase clara
- [ ] 3-5 perguntas de clarificação respondidas
- [ ] MoSCoW aplicado (MUST/SHOULD/COULD/WON'T)
- [ ] Decisão tomada: spec, mais info, adiar, ou rejeitar
- [ ] Se "pronto para spec": RFs/MoSCoW alinhados
- [ ] "WON'T" documentado para evitar scope creep
