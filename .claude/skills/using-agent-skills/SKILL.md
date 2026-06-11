---
name: using-agent-skills
description: Meta-skill para usar o sistema agent-skills corretamente. Use quando iniciar uma nova conversa, ao se sentir perdido sobre qual skill ativar, ou antes de tomar uma decisão sobre qual workflow seguir.
---

# Como Usar o Sistema agent-skills

## Visão Geral

O PediAI adota o sistema **agent-skills** (baseado em [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)) para padronizar workflows, garantir qualidade, e criar uma camada de revisão adversarial. Esta meta-skill explica como navegar o sistema.

## Quando Usar

- Ao iniciar uma sessão nova e não souber qual skill ativar
- Quando o pedido do usuário é ambíguo entre múltiplas skills
- Antes de escolher entre `/build`, `/plan`, `/test`, `/review`
- Quando sentir que está pulando etapas (red flag interno)

## Estrutura do Sistema

O sistema tem **4 camadas** com responsabilidades distintas:

| Camada | O que é | Exemplo | Quem ativa |
|--------|---------|---------|-----------|
| **Skill** | Workflow opinativo com etapas e critérios de saída | `test-driven-development` | Claude Code automaticamente por contexto, ou slash command |
| **Persona** | Papel com perspectiva e formato de saída | `code-reviewer` | Slash command (`/review`, `/ship`) ou Task tool |
| **Command** | Entry-point do usuário (slash) | `/spec`, `/ship` | Usuário diretamente |
| **Reference** | Checklist de domínio carregado sob demanda | `security-checklist.md` | Skill ou persona que precisa |

**Regras de composição:**

- Persona **NÃO** invoca outra persona (composição é trabalho do slash command)
- Persona **PODE** invocar skills
- Skill **NÃO** invoca personas (é a persona que é invocada)
- Slash command orquestra 1 ou mais personas/skills

## Processo: Escolhendo a Skill Certa

1. **Identifique a fase do lifecycle:**
   - Definir o que construir → `spec-driven-development` ou `idea-refine`
   - Planejar como construir → `planning-and-task-breakdown`
   - Construir → `incremental-implementation` + `test-driven-development`
   - Validar → `test-driven-development` + `debugging-and-error-recovery`
   - Revisar → `code-review-and-quality` (persona `code-reviewer`)
   - Enviar → `shipping-and-launch` + `git-workflow-and-versioning`

2. **Verifique os triggers da skill.** Cada `SKILL.md` tem seção "Quando Usar" com bullets específicos. Se nenhum se aplicar, não force a skill.

3. **Em dúvida entre 2+ skills**, escolha a mais conservadora (que adiciona mais checks) e combine com `doubt-driven-development` para revisar a escolha.

4. **Se for trabalho de domínio específico** (ex: criar uma feature de restaurante), ative a skill de domínio correspondente (ex: `pedi-ai-api/.claude/skills/restaurante/SKILL.md`) **junto** com a skill de lifecycle.

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Não preciso de skill, é coisa simples" | Coisas "simples" viram complexas. A skill existe para te forçar a verificar o que você não pensou. |
| "Vou pular a skill pra ir mais rápido" | A skill É a velocidade real. Pular a verificação custa 10x mais tempo depois. |
| "Já sei o que fazer, não preciso de processo" | Saber o que fazer ≠ fazer bem. O processo é a parte que protege. |
| "A skill não se aplica exatamente" | Aplique 80% dela. As 3-5 etapas que se aplicam já valem a pena. |

## Red Flags

- Ignorar `SKILL.md` porque "já li o título"
- Misturar responsabilidades de skill (ex: TDD sem etapa RED)
- Tentar fazer tudo numa única passada sem usar slash commands
- Achar que 24 skills é overkill (na prática você usa 6-8; o resto é arsenal)
- Pular a fase de planning porque "é MVP"

## Verificação

- [ ] Identificou corretamente a fase do lifecycle (Define / Plan / Build / Verify / Review / Ship)
- [ ] Leu a seção "Quando Usar" da skill candidata e bateu pelo menos 1 trigger
- [ ] Se ambíguo, aplicou `doubt-driven-development` para revisar a escolha
- [ ] Ativou a skill de domínio correta quando aplicável
- [ ] Não misturou skills de fases diferentes sem slash command explícito
