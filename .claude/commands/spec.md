---
name: spec
description: Define o que construir. Ativa a skill `spec-driven-development` para criar/atualizar a skill de domínio apropriada. Use para iniciar feature nova ou mudança de comportamento.
---

# /spec — Definir o Que Construir

**Argumentos opcionais:** nome do domínio ou descrição da feature.

## O que este comando faz

1. Identifica o **domínio (bounded context)** relevante
2. Carrega a **skill de domínio** existente (se houver) em `.claude/skills/<domínio>/SKILL.md`
3. Se a feature for ambígua, ativa `idea-refine` (e opcionalmente `interview-me`)
4. Aplica `spec-driven-development` para:
   - Definir objetivo em 1-2 frases
   - Documentar contexto
   - Atualizar modelo de domínio
   - Numerar RFs e RNFs
   - Escrever critérios de aceitação
   - Adicionar racionalizações e red flags

## Skills ativadas

- `using-agent-skills` (sempre — escolhe a skill certa)
- `idea-refine` (se ambíguo)
- `interview-me` (se escopo incerto)
- `spec-driven-development` (sempre)

## Etapas

1. **Identifique o domínio:**
   - Lista de domínios em `pedi-ai-{api,app,e2e}/CLAUDE.md`
   - Se novo, declare e crie a pasta `.claude/skills/<novo-dominio>/`

2. **Leia a skill de domínio existente** (se houver):
   - Estenda o que já está documentado
   - Não duplique RF/RNF existente

3. **Se o pedido for vago**, use `idea-refine` para clarificar:
   - Capture em 1 frase
   - 3-5 perguntas de clarificação
   - MoSCoW (MUST/SHOULD/COULD/WON'T)

4. **Aplique `spec-driven-development`**:
   - Preencha/atualize a skill de domínio
   - Adicione racionalizações (≥ 3)
   - Adicione red flags (≥ 3)
   - Defina verificação

5. **Confirme com o usuário**:
   - "Spec criada em `.claude/skills/<domínio>/SKILL.md`. Revisar antes de planejar?"

## Saída esperada

- Skill de domínio atualizada (ou criada) em `.claude/skills/<domínio>/SKILL.md`
- Tasks opcionais em `tasks.md` (mesma pasta)
- Decisão de próximo passo (`/plan` ou mais clarificação)

## Exemplo

```
Usuário: /spec adicionar busca por nome em restaurantes

Agente: Identifico o domínio `restaurante`. Vou ler a skill existente e estender.

[lê `.claude/skills/restaurante/SKILL.md`]

A skill já tem RF-01 a RF-07. Vou adicionar:
- RF-08: Buscar restaurantes por nome (LIKE/ILIKE)
- RNF-04: Tempo de busca < 300ms
- Critérios de aceitação correspondentes

Adiciono também:
- Racionalização: "Busca pode ser case-insensitive" — realidade: ILIKE é case-insensitive, é o padrão em PostgreSQL
- Red flag: busca sem índice em `nome`

[atualiza a skill]

Spec atualizada. Próximo passo: /plan?
```
