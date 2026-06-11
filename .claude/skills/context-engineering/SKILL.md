---
name: context-engineering
description: Gerencia o contexto fornecido ao agente para melhores resultados. Use ao preparar entrada para Claude Code, ao estruturar prompts, ou quando resultados estão inconsistentes. Use para otimizar a "memória" do agente.
---

# Engenharia de Contexto

## Visão Geral

A qualidade da resposta de um agente é proporcional à qualidade do contexto que ele recebe. Esta skill ensina a estruturar, priorizar, e descartar contexto para que o agente trabalhe com a informação certa — nem pouca (vago), nem demais (perde foco).

## Quando Usar

- Ao preparar pedido complexo para Claude Code
- Ao estruturar CLAUDE.md de subprojeto
- Quando o agente "esquece" decisões anteriores
- Quando resultados estão inconsistentes (mesmo pedido, respostas diferentes)
- Ao decidir o que colocar em `.claude/skills/` vs `.claude/references/`
- Em revisão periódica do CLAUDE.md (trimestral)

## Princípios Fundamentais

### 1. Hierarquia de Contexto

Claude Code processa contexto em camadas, da mais proeminente para a menos:

| Camada | O que | Quando carrega |
|--------|-------|----------------|
| **System prompt** | Identidade, regras inegociáveis | Sempre |
| **CLAUDE.md** | Convenções do projeto, comandos | Carregado por subprojeto |
| **SKILL.md** (ativas) | Workflow específico | Quando trigger bate |
| **References** | Checklists de domínio | Sob demanda |
| **Mensagens do usuário** | Pedido atual | Conversa |
| **Histórico** | Trocas anteriores | Sessão |
| **Files Read** | Arquivos abertos | Sessão |

**Regra:** informação crítica vai na camada alta. Detalhes vão em camadas baixas (references, arquivos).

### 2. Progressive Disclosure

Carregue contexto sob demanda, não tudo de uma vez:

- **Visão geral primeiro** (CLAUDE.md, top-level)
- **Detalhes sob demanda** (SKILL.md quando aplicável)
- **Profundidade sob demanda** (references quando skill precisa)

**Anti-pattern:** despejar 50 arquivos no início. O agente se perde.

### 3. Janela de Atenção

Claude tem atenção limitada. O que está no início e no final do contexto tem mais peso que o meio.

**Posicione informação crítica:**
- **Início do CLAUDE.md** → modo de operação, regras
- **Final do CLAUDE.md** → gotchas, footguns
- **Início de SKILL.md** → "Quando Usar" (triggers)
- **Final de SKILL.md** → "Verificação" (gates)

### 4. Conflito e Precedência

Quando 2 regras conflitam, a mais específica vence. Documente precedência explícita.

**PediAI:**
- `pedi-ai-api/CLAUDE.md` > `CLAUDE.md` raiz > `agent-skills` SKILL.md
- Se skill de domínio diz X e skill de workflow diz Y, prefira a skill de domínio para o domínio dela

## Processo de Engenharia de Contexto

### 1. AUDITAR contexto atual

Pergunte:
- O que o agente sabe ao iniciar a sessão?
- O que ele esquece entre sessões?
- Onde a informação está duplicada?
- O que está em CLAUDE.md mas raramente é usado?
- O que é usado frequentemente mas está buried?

### 2. TRIAGE

Classifique cada item:

| Categoria | Ação | Exemplo |
|-----------|------|---------|
| **Essencial sempre** | Topo do CLAUDE.md | Modo MVP, comandos |
| **Específico de skill** | Mover para SKILL.md | Padrões DDD → skill DDD |
| **Raro mas crítico** | Final do CLAUDE.md | Gotchas, footguns |
| **Já no código** | Remover do contexto | Lista de arquivos em `src/` |
| **Documentação** | Mover para `docs/` | Tutoriais, ADRs |

### 3. COMPOR nova estrutura

- **CLAUDE.md** enxuto (~200-300 linhas), só o que precisa sempre
- **SKILL.md** por domínio ou workflow, ativado por trigger
- **References/** sob demanda
- **AGENTS.md** raiz com convenções cross-projeto

### 4. VALIDAR

- Claude Code segue as regras ao trabalhar?
- Pedidos não-ambíguos geram resultados consistentes?
- Contexto é carregado na ordem certa?

## Anti-Patterns

| Anti-pattern | Por que é ruim | Correção |
|--------------|----------------|----------|
| CLAUDE.md > 1000 linhas | Agente perde foco | Dividir em skills |
| Tudo em CLAUDE.md | Ignora progressive disclosure | Mover para references |
| Regras em comentários no código | Não carrega no contexto | Mover para CLAUDE.md/skills |
| Spec repetida em CLAUDE.md | Drift entre docs | Apontar para spec, não duplicar |
| Prompt enorme no início | Agente fica overwhelmed | Progressive disclosure |
| Conflito entre docs | Agente escolhe errado | Hierarquia explícita |

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Mais contexto = melhor" | Mais contexto = mais ruído. Contexto certo > muito contexto. |
| "Vou colocar tudo no CLAUDE.md" | CLAUDE.md não é manual. É referência rápida. |
| "Documentação repetida garante consistência" | Repetição garante drift. Single source of truth > duplicação. |
| "Contexto não importa, modelo é inteligente" | Modelo é tão bom quanto o input. Contexto ruim = output ruim. |
| "Vou ajustar depois se precisar" | Depois = nunca. Estruture o contexto antes. |

## Red Flags

- CLAUDE.md > 500 linhas
- Regras espalhadas (CLAUDE.md, README, código, ADRs, sem hierarquia)
- Informação crítica no meio do CLAUDE.md (deve estar no topo)
- Conflito entre docs sem precedência explícita
- Contexto carregado mas nunca usado (desperdiça atenção)
- Spec ou regra que mudou mas doc não foi atualizado

## Verificação

- [ ] CLAUDE.md enxuto (< 300 linhas preferencialmente)
- [ ] Informação crítica no topo (modo operação, regras)
- [ ] Gotchas no final
- [ ] SKILL.md com "Quando Usar" claro (triggers)
- [ ] References/ sob demanda
- [ ] Hierarquia de precedência explícita
- [ ] Sem duplicação entre docs
- [ ] Docs atualizados quando código/spec muda
