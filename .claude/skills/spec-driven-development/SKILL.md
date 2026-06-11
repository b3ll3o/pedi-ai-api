---
name: spec-driven-development
description: Desenvolvimento guiado por especificação. Use ao iniciar qualquer feature nova, mudança de comportamento, ou decisão arquitetural. Use quando precisar definir o "o quê" e "por quê" antes do "como".
---

# Desenvolvimento Orientado a Especificação

## Visão Geral

Escrever a especificação **antes** de implementar transforma requisitos implícitos em decisões explícitas, testáveis e revisáveis. No PediAI, cada domínio tem uma skill dedicada em `.claude/skills/<domínio>/SKILL.md` que funciona como contrato vivo.

## Quando Usar

- Ao iniciar uma feature nova (sempre)
- Ao mudar comportamento de feature existente
- Antes de mudanças arquiteturais (combinado com `planning-and-task-breakdown`)
- Quando há ambiguidade sobre escopo ("o que entra e o que não entra?")
- Antes de criar uma migration ou alterar `prisma/schema.prisma`

## Processo

1. **Identifique o domínio (bounded context)**
   - Lista de domínios do PediAI: ver `.claude/skills/` de cada subprojeto
   - Se o domínio não existe, crie a skill de domínio (não é mudança trivial)

2. **Leia a skill de domínio existente** (se houver)
   - `.claude/skills/<domínio>/SKILL.md` já tem RFs, RNFs, modelo de domínio, racionalizações e red flags
   - Estenda a skill existente, não crie uma nova

3. **Defina o Objetivo em 1-2 frases**
   - O que resolve, para quem
   - Sem jargão técnico — objetivo de negócio

4. **Documente o Contexto**
   - Situação atual (o que existe)
   - Problema (por que mudar)
   - Restrições (RNFs, dependências, deploy)

5. **Atualize o Modelo de Domínio** (na skill de domínio)
   - Entidades, agregados, value objects
   - Invariantes
   - Eventos de domínio (se aplicável)

6. **Numere os Requisitos Funcionais (RF)**
   - RF-01, RF-02, ... — cada um testável
   - Frase imperativa: "RF-03: Listar todos os restaurantes ativos"
   - Sem detalhes de implementação

7. **Numere os Requisitos Não-Funcionais (RNF)**
   - RNF-01: cobertura ≥ 80%
   - RNF-02: tempo de resposta < 200ms
   - RNF-03: suporte a X usuários simultâneos
   - Tudo mensurável

8. **Escreva Critérios de Aceitação verificáveis**
   - Formato: "POST /recurso com X retorna 201 e payload Y"
   - Cada CA deve ser testável por E2E

9. **Adicione Racionalizações Comuns** (se skill de domínio nova)
   - Tabela com desculpas típicas + realidade
   - Mínimo 3 entradas

10. **Adicione Red Flags** (se skill de domínio nova)
    - Sinais de que algo está errado no domínio
    - Mínimo 3 bullets

11. **Defina a Verificação**
    - Comandos a rodar: `npm run lint`, `npm test`, `npm run test:cov`
    - Critérios de aceitação marcados
    - Coverage mantido em 80%+

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "É mudança pequena, não precisa de spec" | Mudanças pequenas que ignoram spec viram débitos médios. Spec de 10 linhas já vale. |
| "Já conversei com o stakeholder, está alinhado" | Conversa oral vira esquecimento. Spec escrita vira contrato. |
| "Spec atrasa a entrega" | Spec mal escrita atrasa. Spec bem escrita é a velocidade real. |
| "Vou escrever a spec durante a implementação" | Isso é documentação, não spec. Spec define o destino; código é o caminho. |
| "O código é a spec" | O código diz o que está sendo feito, não o que deveria. Spec diz a intenção. |
| "Stack overflow / chat GPT resolveu" | Respostas externas não conhecem seu domínio. Especificar é o trabalho de quem conhece. |

## Red Flags

- Spec sem pelo menos 1 RF mensurável
- RFs que começam com "deveria poder..." (vago)
- Spec sem critério de aceitação para o caminho feliz
- Critérios de aceitação que dependem de julgamento humano ("parece bom")
- Spec criada depois do código (não é spec, é documentação retroativa)
- Spec sem modelo de domínio atualizado (entidades novas não documentadas)
- Spec que mistura "o quê" com "como" (ex: "usar React Query para...")
- Spec sem RNFs de cobertura/performance

## Verificação

- [ ] Skill de domínio localizada e atualizada (ou criada se não existir)
- [ ] Objetivo em 1-2 frases, sem jargão técnico
- [ ] Contexto com situação atual + problema + restrições
- [ ] Modelo de domínio com entidades, agregados, VOs, invariantes
- [ ] RFs numerados, testáveis, sem detalhes de implementação
- [ ] RNFs mensuráveis
- [ ] Critérios de aceitação verificáveis (não subjetivos)
- [ ] Racionalizações comuns adicionadas (≥ 3)
- [ ] Red flags adicionados (≥ 3)
- [ ] Verificação com comandos concretos
