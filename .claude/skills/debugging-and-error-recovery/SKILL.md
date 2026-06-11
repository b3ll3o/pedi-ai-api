---
name: debugging-and-error-recovery
description: Depura issues e recupera de erros. Use ao enfrentar bug não óbvio, stack trace confuso, ou erro intermitente. Use quando o problema não responde a tentativa-e-erro direta.
---

# Depuração e Recuperação de Erros

## Visão Geral

Depuração eficiente exige **método**, não tentativa e erro. Esta skill guia um processo estruturado: **reproduzir → isolar → entender → corrigir → prevenir**. A última etapa (prevenir com teste de regressão) é a que mais often falta — sem ela, o mesmo bug volta.

## Quando Usar

- Bug não óbvio (não está claro onde está)
- Stack trace confuso (vem de lib externa, sem contexto)
- Erro intermitente (flaky test, race condition)
- Quando tentativa e erro já gastou > 15 minutos sem sucesso
- Quando o "fix" não está claro mesmo sabendo onde está

## Processo (5 Etapas)

### 1. Reproduzir

**Antes de qualquer coisa, reproduza o bug de forma confiável.**

- Tem teste que falha? Caso contrário, escreva um.
- Use o pattern "Prove-It" do TDD: o teste é sua asserção de que o problema existe.
- Se o bug é intermitente, documente as condições (horário, carga, dados).

**Perguntas:**
- O que exatamente acontece vs o que deveria acontecer?
- Quais inputs disparam? Quais não disparam?
- É 100% reprodutível ou intermitente?
- Acontece em dev, em prod, em ambos?

### 2. Isolar

**Reduza o problema ao menor caso possível.**

- Binário search no código (comente metade, veja se ainda acontece)
- Remova camadas (Prisma direto sem NestJS? Teste unitário do use case? Reproduz em script?)
- Identifique o **componente mínimo** que exibe o problema
- Se o bug é de integração, teste cada lado separadamente

**Perguntas:**
- O bug é na entidade, no use case, no repository, no controller, ou na integração?
- É de dados, de lógica, ou de configuração?
- Acontece com dados válidos, inválidos, ou ambos?

### 3. Entender

**Por que isso acontece? Não só "como reproduzir", mas "por que".**

- Leia a stack trace de baixo pra cima (última frame é onde está o erro)
- Preste atenção em:
  - `undefined` vs `null` (TypeScript: `!` non-null assertion esconde bugs)
  - Async sem await (Promise não esperada)
  - Mutação concorrente (race condition em Prisma)
  - Schema Prisma desincronizado com código
  - Migration não aplicada
  - Cache stale
- Para bugs intermitentes: timing, garbage collector, throttling

**Perguntas:**
- O que mudou recentemente? (git log, package.json, schema.prisma)
- Esse caminho de código já foi exercitado antes?
- Há invariantes assumidas que podem não se sustentar?

### 4. Corrigir

**A correção mínima que resolve a causa raiz (não o sintoma).**

- Se você pensou em "vou adicionar um `if (x) return null` aqui", provavelmente está mascarando o problema
- A correção certa ataca a causa raiz (input inválido, validação faltando, race condition)
- Considere: a correção introduz outro bug? (`doubt-driven-development`)

**Checklist antes de commitar:**
- O teste de regressão que reproduzia o bug agora passa?
- Nenhum teste existente quebrou?
- Coverage não caiu?
- A correção está no lugar certo? (validação no DTO, não no controller)

### 5. Prevenir

**Garanta que o mesmo bug não volte.**

- Adicione teste de regressão (no nível certo — unitário para lógica, E2E para fluxo)
- Documente a causa raiz em comentário se for não-óbvio
- Se a correção foi em validação, valide TODOS os outros endpoints pelo mesmo padrão
- Adicione à lista de "red flags" da skill de domínio se for erro comum

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Já entendi, vou direto pro fix" | Fix sem entender = novo bug em 1 semana. Gastar 10 min economiza 1 dia. |
| "É óbvio o que está errado" | Bugs nunca são óbvios. Se fosse, não seria bug. |
| "Vou adicionar try/catch pra resolver" | try/catch esconde erro. Identifica e corrige a causa. |
| "Não preciso de teste, é óbvio que está corrigido" | "Óbvio" é palavra de quem ainda não rodou o teste. |
| "Vou commitar sem rodar suite, é mudança pequena" | Mudança pequena sem suite = surpresa grande em prod. |
| "Bug intermitente, não tem como testar" | Tem sim. Mas precisa de fixture, mock de tempo, ou simulação de carga. |

## Red Flags

- Tentou mais de 3 coisas aleatórias sem entender a causa
- "Fix" é try/catch genérico que engole o erro
- Teste de regressão não foi escrito
- Stack trace não foi lido inteiro
- Suspeita da causa mas não provou
- Correção está no lugar errado (controller em vez de use case)
- Não rodou suite completa após o fix
- Não documentou a causa raiz

## Verificação

- [ ] Bug reproduzido de forma confiável (teste que falha)
- [ ] Causa raiz identificada e entendida (não só sintoma)
- [ ] Fix mínimo que resolve a causa raiz
- [ ] Teste de regressão adicionado
- [ ] Teste de regressão falha ANTES do fix, passa DEPOIS
- [ ] Todos os testes existentes continuam passando
- [ ] Coverage mantido em ≥ 80%
- [ ] Causa raiz documentada se não-óbvio
