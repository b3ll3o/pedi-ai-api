---
name: review
description: Revisa código antes de merge. Invoca a persona `code-reviewer` (ou `security-auditor`/`web-performance-auditor` por foco). Use antes de commit/merge.
---

# /review — Revisar Antes de Merge

**Argumentos opcionais:** foco (`security`, `performance`, `general`) ou caminho de arquivo.

## O que este comando faz

1. Identifica as mudanças a revisar (`git diff`, `git status`)
2. Lê contexto: spec (skill de domínio) + tarefas pendentes/concluídas
3. Aplica a persona apropriada:
   - `general` (default) → `code-reviewer` (5 eixos)
   - `security` → `security-auditor` (OWASP)
   - `performance` → `web-performance-auditor` (Core Web Vitals)
4. Reporta findings com severidade

## Skills ativadas

- `using-agent-skills`
- `code-review-and-quality` (sempre)
- `security-and-hardening` (se foco = security)
- `performance-optimization` (se foco = performance)

## Personas invocadas

- `code-reviewer` (default)
- `security-auditor` (se foco = security)
- `web-performance-auditor` (se foco = performance)

## Etapas

1. **Identifique as mudanças:**
   - `git status` — arquivos modificados
   - `git diff --stat` — visão geral
   - `git diff` — conteúdo (se pequeno)

2. **Colete contexto:**
   - Skill de domínio relevante (qual feature está sendo implementada?)
   - `tasks.md` — quais tarefas foram concluídas?
   - PR/commit messages recentes

3. **Execute a persona apropriada** (5 eixos para `code-reviewer`):
   - Corretude, Legibilidade, Arquitetura, Segurança, Performance

4. **Reporte no formato da persona:**

   ```markdown
   ## Revisão: <arquivo ou PR>

   ### Resumo
   <veredicto geral + pontos fortes>

   ### Achados
   #### [Crítico] ...
   #### [Importante] ...
   #### [Nit] ...
   #### [Opcional] ...
   #### [FYI] ...

   ### Verificação
   - [ ] Testes cobrem o novo comportamento
   - [ ] Build passa
   - [ ] Coverage ≥ 80%

   ### Veredicto
   ✅ Aprovar | 🔄 Solicitar mudanças | 💬 Comentar
   ```

5. **Pause para ação:**
   - ✅ Aprovar → pronto para commit/merge
   - 🔄 Solicitar mudanças → aplique fixes, depois `/review` de novo
   - 💬 Comentar → discuta findings antes de decidir

## Modo `security`

`/review security` — foco em segurança. Usa persona `security-auditor`. Checks OWASP + PediAI (bcrypt, JWT, RBAC, validação, CORS, Prisma).

## Modo `performance`

`/review performance` — foco em performance. Usa persona `web-performance-auditor`. Mede Core Web Vitals, bundle size, queries N+1.

## Saída esperada

- Findings priorizados por severidade
- Veredicto claro (aprovar, mudar, comentar)
- Lista de verificação (gates)

## Exemplo

```
Usuário: /review security

Agente: Mudanças detectadas: src/auth/auth.service.ts, src/auth/auth.controller.ts

Aplicando persona security-auditor (OWASP)...

[análise]

## Revisão: src/auth/* (foco: segurança)

### Resumo
Boa estrutura, mas 1 achado crítico: refresh token não tem rotação implementada (A07).

### Achados
#### [Crítico] Refresh token sem rotação
- **Local**: src/auth/auth.service.ts:87
- **OWASP**: A07 (Auth Failures)
- **Impacto**: Token roubado vale até expirar (7 dias)
- **Mitigação**: Implementar rotação — a cada uso, gerar novo e invalidar antigo

#### [Médio] Senha em log em caso de erro
- **Local**: src/auth/auth.service.ts:42
- **Mitigação**: Remover senha do log de erro

### Veredicto
🔄 Solicitar mudanças
```
