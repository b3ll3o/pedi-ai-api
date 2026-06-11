---
name: source-driven-development
description: Desenvolvimento ancorado em material-fonte. Use ao implementar com base em documentação externa, RFC, padrão de mercado, ou quando precisa de fidelidade à especificação original. Use para evitar reinventar a roda.
---

# Desenvolvimento Orientado por Fonte

## Visão Geral

Muito do trabalho de software é **implementar uma especificação externa** (RFC, padrão, lib, OpenAPI). Esta skill garante fidelidade à fonte, ao invés de improvisar. Use ao implementar com base em doc oficial, padrão, ou contrato externo.

## Quando Usar

- Ao implementar endpoint de API externa (pagamento, OAuth, etc)
- Ao seguir RFC ou protocolo (HTTP, JWT, OAuth, OIDC)
- Ao integrar com lib terceira (Prisma, Next.js, NestJS)
- Ao implementar formato de arquivo (CSV, JSON Schema)
- Ao seguir design system ou style guide
- Ao portar de outra implementação (Python → TS, por exemplo)

## Princípios

### 1. Fonte é a verdade

A documentação oficial (ou RFC, ou contrato) é a referência primária. **Não improvise** se a doc diz X.

**Fonte > "achismo" > modelo de treinamento.**

Cuidado: o modelo pode "lembrar" de uma versão antiga. Sempre confirme com a fonte atual (WebFetch, docs locais).

### 2. Fidelidade, não criatividade

Ao implementar:
- Use os **nomes exatos** de campos/métodos da spec
- Use os **códigos de erro** exatos (4xx, 5xx) que a spec define
- Use os **headers** que a spec define
- Não invente campos extras (quebra clientes que seguem a spec)

### 3. Citações como evidência

Em comentários ou commit messages, cite a fonte:
```typescript
// RFC 7519 §4.1.4: "exp" (Expiration Time) claim
// https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4
if (decoded.exp && decoded.exp < Date.now() / 1000) {
  throw new TokenExpiredError();
}
```

**Citação dá rastreabilidade.** Se a spec mudar, você sabe onde olhar.

### 4. Versão é importante

Documente qual versão da spec/lib você está seguindo:
- "Seguindo RFC 7519 (JWT)" — sem versão
- "Seguindo @nestjs/jwt 11.x" — específico
- "Seguindo Next.js 16 App Router" — específico

Versão diferente = comportamento potencialmente diferente.

## Processo

### 1. Identificar fontes

Antes de implementar, liste as fontes:
- Documentação oficial (URL, versão)
- RFC ou padrão (número, seção)
- Contrato OpenAPI/Swagger
- README e exemplos da lib
- Código-fonte da lib (último recurso, para entender comportamento exato)

### 2. Ler a fonte relevante

- Não leia tudo. Leia a seção que implementa.
- Use WebFetch para docs externas (`https://nextjs.org/docs/...`)
- Para libs, prefira o source local (`node_modules/<lib>/...`)

### 3. Implementar com fidelidade

- Copie o exemplo da doc se houver
- Use os tipos/contratos exatos
- Citações inline em código não-óbvio
- Documente versão no commit

### 4. Validar com a fonte

Após implementar, releia a fonte e verifique:
- Cobri todos os requisitos da seção?
- Casos de erro estão tratados?
- Edge cases mencionados na spec?
- Limites (tamanho, formato, encoding) respeitados?

### 5. Citar no commit

Mensagem do commit cita a fonte:
```
feat(auth): implementar refresh token rotation

Seguindo RFC 6749 §6 + @nestjs/jwt 11.x docs.
Cada refresh invalida o anterior (rotation).
```

## Fontes Comuns no PediAI

| Domínio | Fonte |
|---------|-------|
| `auth` | RFC 7519 (JWT), RFC 6749 (OAuth 2.0), @nestjs/jwt docs |
| `api` | OpenAPI spec, NestJS 11 controllers docs, Prisma 7 docs |
| `app` | Next.js 16 docs (oficial!), React 19 docs, Tailwind v4 docs |
| `e2e` | Playwright docs, RFC 6265 (cookies) |
| `db` | Prisma docs, PostgreSQL 15 docs |
| `deploy` | GitHub Actions docs, systemd docs |

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Eu já sei como JWT funciona" | JWT tem 7+ claims, validações específicas, edge cases. Saber ≠ implementar correto. |
| "Doc está desatualizada" | Doc pode estar. Spec oficial não. Confirme com fonte primária. |
| "Versão X ou Y, tanto faz" | Tanto faz não. Breaking changes existem. Verifique. |
| "Vou improvisar, é mais simples" | Improvisar agora custa reescrever quando spec bater. |
| "Doc não cobre meu caso" | Doc cobre. Leia tudo, ou pergunte no issue tracker. |

## Red Flags

- Implementação diverge da spec sem justificativa
- Sem citação de fonte em código que segue padrão externo
- Versão da lib não documentada
- Doc não foi consultada (achismo do modelo)
- Edge case da spec não tratado
- Comportamento padrão da spec foi "otimizado" sem evidência
- Sem teste que valide conformidade com a spec

## Verificação

- [ ] Fontes identificadas e citadas
- [ ] Implementação segue spec fielmente (campos, códigos, headers)
- [ ] Versão da lib/spec documentada
- [ ] Edge cases da spec cobertos
- [ ] Teste de conformidade com a spec
- [ ] Citação em código não-óbvio
- [ ] Commit message cita fonte
