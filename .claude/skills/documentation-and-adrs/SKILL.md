---
name: documentation-and-adrs
description: Escreve documentação útil e ADRs. Use ao tomar decisão arquitetural, ao criar feature pública, ou ao documentar algo não-óbvio. Use para evitar "por que isso foi feito assim?" 6 meses depois.
---

# Documentação e ADRs

## Visão Geral

Documentação ruim é piada que ninguém entende. Documentação boa é a resposta certa, no lugar certo, no momento certo. Esta skill ensina a escrever **docs que sobrevivem** — explicam *por que*, são fáceis de achar, e ficam atualizadas.

## Quando Usar

- Ao tomar decisão arquitetural (criar ADR)
- Ao criar feature pública (atualizar API docs, README)
- Ao documentar decisão não-óbvia (comentário inline)
- Ao criar tutorial de setup
- Em revisão periódica de docs (trimestral)

## Princípios

### 1. Documente o "por que", não o "o que"

- ❌ "Esta função valida CNPJ"
- ✅ "Validamos CNPJ com dígitos verificadores (não só formato) porque validação só-de-formato aceita CNPJs claramente falsos como `00.000.000/0000-00`"

Código é o "o que" (ele mesmo se documenta). Comentários explicam o "por que".

### 2. Documentação certa, no lugar certo

| Tipo de doc | Onde |
|-------------|------|
| Como instalar | README |
| Decisão arquitetural | ADR em `docs/adr/` ou `.claude/notes/` |
| Padrão de uso (skill) | `.claude/skills/<domínio>/SKILL.md` |
| Convenção de projeto | `CLAUDE.md` |
| API pública | OpenAPI/Swagger gerado |
| Comentário não-óbvio | Inline no código |
| Tutorial | `docs/` ou wiki |

### 3. Doc vivo, não momificado

- Doc desatualizada é pior que ausência de doc
- Quem muda o código, atualiza a doc junto (ou abre ticket)
- Doc sem dono vira lixo
- Doc que ninguém lê, vira lixo

### 4. Exemplos > explicações

Mostre, não conte:

```markdown
❌ "Esta função cria um restaurante passando um DTO"

✅ ```typescript
const dto: CreateRestauranteDto = {
  nome: "Restaurante X",
  cnpj: "12.345.678/0001-90",
  // ...
};
const restaurante = await api.restaurantes.criar(dto);
```
```

## ADR (Architecture Decision Record)

Pequeno doc que registra uma decisão arquitetural importante.

### Estrutura

```markdown
# ADR-001: <título da decisão>

## Status
Proposta | Aceita | Depreciada | Substituída por ADR-XXX

## Contexto
Qual é o problema? Que restrições? Que forças em jogo?

## Decisão
O que decidimos fazer? (1-3 frases)

## Consequências

### Positivas
- ...

### Negativas
- ...

### Neutras
- ...

## Alternativas Consideradas
- **Opção A:** <descrição> — descartada por <motivo>
- **Opção B:** <descrição> — descartada por <motivo>

## Data
YYYY-MM-DD
```

### Quando Criar

- Decisão que afeta múltiplos módulos/domínios
- Decisão difícil de reverter
- Decisão que tem trade-off não-óbvio
- Decisão que você vai esquecer em 3 meses

### Quando NÃO Criar

- Decisão trivial (escolha de lib entre 2 equivalentes)
- Decisão local (1 arquivo, sem impacto amplo)
- Decisão que é apenas "boa prática" (já documentada em skill/CLAUDE.md)

### Onde Guardar

- `docs/adr/0001-titulo-curto.md` (PediAI pode não ter; criar se for usar)
- Ou `openspec/notes/adr/` (legado — migrar)
- Ou `.claude/notes/adr/` (futuro)

**PediAI atual:** não tem pasta formal. Comece criando `docs/adr/` ao primeiro ADR.

## Comentários Inline

### Bom

```typescript
// Use bcrypt cost 12 (vs default 10) — password hashing guide NIST 800-63B
const SALT_ROUNDS = 12;

// RFC 7519 §4.1.4: "exp" claim required
if (!decoded.exp) throw new InvalidTokenError();
```

### Ruim

```typescript
// Loop sobre usuários
for (const user of users) { ... }

// Incrementa contador
counter++;
```

## README

README raiz do projeto deve ter (em pt-BR para PediAI):

```markdown
# PediAI - <subprojeto>

<1-2 frases: o que é>

## Setup Rápido
<passos mínimos para rodar localmente>

## Comandos
<principais comandos com breve descrição>

## Arquitetura
<diagrama ou descrição de alto nível>

## Onde encontrar mais
- CLAUDE.md — convenções e detalhes
- .claude/skills/ — workflows de desenvolvimento
- docs/ — ADRs, tutoriais
```

PediAI já tem CLAUDE.md cumprindo vários desses papéis. README pode ser mais enxuto.

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Código é autoexplicativo" | Código é o "o que". Decisão de design não está no código. |
| "Vou documentar depois" | "Depois" é quando ninguém lembra. Documente agora ou nunca. |
| "ADR é burocracia" | ADR é 15 min de escrita. 1 dia de debug pra reverter decisão sem ADR. |
| "README enorme impressiona" | README enorme ninguém lê. Enxuto e linkar é melhor. |
| "Doc desatualizada ainda é referência" | Doc errada é pegadinha. Doc nenhuma é honesto. Doc desatualizada é cilada. |
| "Exemplo é óbvio" | Óbvio pra quem escreveu. Opaco pra quem chega. |

## Red Flags

- Comentário que apenas repete o código
- Doc que não tem dono (ninguém mantém)
- Doc com > 1 ano sem update (suspeita)
- ADR sem "alternativas consideradas" (análise fraca)
- Decisão importante sem ADR
- "Vou documentar depois" sem ticket
- README > 200 linhas (provavelmente info misplaced)
- Doc em local errado (ex: setup no CLAUDE.md, decisão no README)

## Verificação

- [ ] Decisão arquitetural documentada em ADR
- [ ] ADR tem contexto, decisão, consequências, alternativas
- [ ] Comentários inline explicam "por que" (não "o que")
- [ ] Doc no lugar certo (CLAUDE.md vs skill vs README vs ADR)
- [ ] Doc tem dono (time ou pessoa)
- [ ] Doc atualizada quando código muda
- [ ] Exemplos incluídos (não só explicação)
- [ ] Sem doc desatualizada > 1 ano
