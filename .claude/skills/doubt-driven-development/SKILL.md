---
name: doubt-driven-development
description: Desenvolvimento guiado por questionamento ativo. Use antes de finalizar uma decisão, claim, ou commit. Use quando você ou outro agente fizer uma afirmação forte que afeta produção. Use como revisão adversarial.
---

# Desenvolvimento Orientado por Dúvida

## Visão Geral

A maior fonte de bugs em código assistido por IA não é erro de sintaxe — é **confiança injustificada**. Esta skill implementa um ciclo adversarial: **CLAIM → EXTRACT → DOUBT → RECONCILE → STOP**, forçando o agente a duvidar ativamente das próprias afirmações antes de comprometer código.

## Quando Usar

- Antes de fazer merge de uma feature standard/major
- Quando uma claim é feita sem evidência ("está funcionando", "todos os casos cobertos")
- Quando você quer revisar código seu de uma sessão anterior
- Antes de commit que toca `prisma/schema.prisma` ou auth
- Quando múltiplas skills poderiam aplicar e você não tem certeza de qual

## O Ciclo

### 1. CLAIM

Articule explicitamente a afirmação. Formato:

```
CLAIM: <afirmação específica>
EVIDÊNCIA: <o que sustenta a afirmação>
```

Exemplo:
```
CLAIM: "O endpoint POST /restaurants rejeita CNPJs duplicados"
EVIDÊNCIA: "Há teste em restaurantes.e2e-spec.ts: 'deve retornar 409 ao criar CNPJ duplicado' e o teste passa"
```

### 2. EXTRACT

Identifique os componentes testáveis da claim:

- Quais inputs ela cobre? (válidos, inválidos, edge cases)
- Quais outputs ela promete? (status code, payload, side effects)
- Quais invariantes ela assume? (estado do banco, autenticação, etc)

### 3. DOUBT

Aplique pelo menos 3 questionamentos adversariais:

| Dúvida | Por que importa |
|---|---|
| "Qual é o pior input que faz a claim falhar?" | Edge cases são onde bugs vivem |
| "O que acontece se o invariante não se sustenta?" | Invariantes assumidas != invariantes garantidas |
| "Há caminho feliz coberto, mas há caminho de erro coberto?" | Cobertura 80% de 1 caminho ≠ cobertura real |
| "O teste prova o comportamento OU prova que o teste rodou?" | Teste que passa no primeiro run é suspeito |
| "Se eu fosse o atacante, como quebraria isso?" | Mindset adversarial acha vulnerabilidades |
| "O nome da função/método promete mais do que entrega?" | Nomes mentirosos viram bugs futuros |
| "Se eu remover este código, qual teste quebra?" | Teste que não quebra = teste inútil |

### 4. RECONCILE

Para cada dúvida, responda com evidência:

- **Confirmada**: rode um teste ou comando que prove
- **Refutada**: a claim precisa ser ajustada
- **Irrelevante**: documente por que não se aplica

### 5. STOP

Se qualquer dúvida resultar em refutação ou evidência insuficiente, **pare** e:
- Atualize a claim
- Adicione teste/validação que prove o ponto duvidoso
- Refaça o ciclo até todas as dúvidas serem resolvidas

## Exemplo Aplicado

```markdown
CLAIM: "Autenticação está segura contra CSRF"

EXTRACT:
- Inputs: cookies de sessão, headers Origin/Referer
- Outputs: 200 (válido) ou 403 (inválido)
- Invariantes: SameSite=Strict em cookies, CORS allowlist, CSRF token

DOUBT:
1. "E se o cookie não tiver SameSite?" → Verificar `auth.service.ts:42` — SameSite=Lax, não Strict
2. "E se Origin não vier?" → Verificar guard — ele checa Origin? Sim.
3. "E se um subdomínio malicioso for usado?" → Verificar CORS allowlist — só prod.com, ok.

RECONCILE:
- "SameSite=Lax é suficiente para nosso caso" (não é Strict mas protege contra CSRF clássico)
- "Origin checado ✓"
- "CORS allowlist restritivo ✓"

STOP: ✓ Reconciliação completa. Claim segura para commitar com nota sobre SameSite=Lax.
```

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "O código é simples, não precisa duvidar" | Bugs mais caros são em código "óbvio" que ninguém revisou. |
| "Os testes passam, está provado" | Testes que passam provam que rodaram, não que provam o que você pensa. |
| "Eu que escrevi, sei que está certo" | Autor é cego aos próprios pressupostos. Toda mudança merece outro par de olhos. |
| "Não tenho tempo para duvidar agora" | Dúvida agora custa 5 min. Bug em produção custa horas/dias. |
| "Já rodei 2x, está funcionando" | Run limpa + sem mudança = informação zero. |
| "A spec garante que está certo" | Spec diz intenção. Código pode divergir. |

## Red Flags

- Claim sem evidência explícita
- Respostas na etapa DOUBT que começam com "acho que..."
- Reconciliação sem teste/comando que prove
- Pular etapa DOUBT porque "é óbvio"
- Aplicar dúvida apenas 1 vez em vez das 3 mínimas
- Claim de segurança sem teste de penetração
- Claim de performance sem benchmark
- Claim de cobertura sem rodar `npm run test:cov`

## Verificação

- [ ] Toda claim foi articulada no formato CLAIM + EVIDÊNCIA
- [ ] Pelo menos 3 dúvidas aplicadas na etapa DOUBT
- [ ] Cada dúvida foi reconciliada com comando/teste/inspeção de código
- [ ] Nenhuma dúvida ficou em "acho que" — todas com evidência
- [ ] Se refutação ocorreu, claim foi atualizada e ciclo refeito
- [ ] Aplicado antes de merge de feature standard/major
