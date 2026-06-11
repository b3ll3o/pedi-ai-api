---
name: deprecation-and-migration
description: Lida com depreciações e migrações de código/dados. Use ao remover API antiga, ao migrar schema de banco, ou ao atualizar dependência major. Use para planejar transições sem quebrar clientes.
---

# Deprecação e Migração

## Visão Geral

Toda feature eventualmente vira legado. A questão não é "se" deprecia, mas "como" deprecia sem quebrar usuários. Esta skill guia o processo: **avisar → coexistir → migrar → remover**, com janelas de tempo e métricas.

## Quando Usar

- Ao remover endpoint, campo, ou rota antiga
- Ao renomear campo em resposta de API
- Ao migrar schema Prisma (rename, drop, type change)
- Ao atualizar dependência para versão major (NestJS 10 → 11, Next 15 → 16)
- Ao trocar implementação interna (driver, ORM, storage)
- Ao mudar contrato que clientes (externos ou internos) consomem

## Princípios

### 1. Coexistência antes de remoção

Nunca remova o antigo antes do novo estar provado. Mantenha ambos rodando até migração completa.

### 2. Aviso explícito

- **Header `Deprecation`** (RFC 8594): `Deprecation: true` + `Sunset: <date>`
- **Header `Sunset`**: data em que o recurso será removido
- **Link `successor-version`**: aponta para o novo
- **Log de warning** server-side toda vez que cliente usa o recurso antigo
- **Email/notificação** a clientes conhecidos (se houver)

### 3. Janela de tempo

Mínimo recomendado: **2 ciclos de release** ou **3 meses**, o que for maior. Para schema de banco, mais.

### 4. Métricas de adoção

Antes de remover, meça:
- Quantos clientes ainda usam?
- Quais campos/rotas?
- Volume de tráfego?
- Erros reportados?

Se > 5% dos requests ainda usam, não remova.

## Processo

### 1. ANUNCIAR

1. Crie ADR (Architecture Decision Record) documentando:
   - O que está sendo depreciado
   - Por que (motivo, não "está velho")
   - Janela de tempo
   - Migração proposta
2. Adicione header `Deprecation: true` na resposta
3. Adicione `Sunset: <data-ISO>` header
4. Log warning server-side
5. Comunique stakeholders (email, Slack, doc)

### 2. COEXISTIR

- Mantenha recurso antigo funcionando
- Implemente o novo em paralelo
- Cliente pode migrar gradualmente
- Documente mapping (antigo → novo) claramente

```typescript
// Antigo: GET /users/:id (retorna user com role embutida)
// Novo: GET /users/:id (retorna user) + GET /users/:id/role

@Controller('users')
export class UsersController {
  @Get(':id')
  @Header('Deprecation', 'true')  // só no path antigo
  @Header('Link', '</users/:id/role>; rel="successor-version"')
  async findOne(@Param('id') id: string) {
    // Ainda funciona como antes (compat)
  }
}
```

### 3. MIGRAR

- Documente passo-a-passo da migração para o usuário
- Forneça script de migração de dados se aplicável
- Forneça exemplos antes/depois
- Ofereça suporte (issue, email) durante janela

### 4. REMOVER

- Apenas quando métricas mostram < 1% de uso
- Documente a remoção no changelog
- Avise novamente 1 release antes (`Sunset` passa de aviso para remoção)
- Após remoção, remova o código (não deixe shims)

## Migração de Schema Prisma

### Cenário: renomear coluna

```prisma
// Antes
model User {
  nome_completo String
}

// Depois
model User {
  nomeCompleto String @map("nome_completo")
}
```

**Passos:**

1. Adicione nova coluna (`nomeCompleto`)
2. Migration preenche `nomeCompleto = nome_completo`
3. Backend lê de `nomeCompleto` (escrita em ambos)
4. Backend escreve em `nomeCompleto` (leitura de ambos)
5. Backend só lê de `nomeCompleto` (escrita deprecada em `nome_completo`)
6. Backend para de escrever em `nome_completo`
7. Remove coluna `nome_completo` (migration)

**Cada passo é um deploy. Não pule.**

### Cenário: mudar tipo

```prisma
// Antes: String
// Depois: Decimal
model Restaurante {
  preco Decimal @db.Decimal(10, 2)
}
```

1. Adicione coluna nova com tipo novo
2. Migration converte dados (com cuidado de precisão)
3. Backend lê de coluna nova
4. Backend escreve em coluna nova
5. Remove coluna antiga

**Atenção:** conversão de tipo pode perder dados. Faça backup, rode em staging, monitore.

### Cenário: remover coluna

Apenas após confirmar que ninguém usa:

1. `grep -r "nome_completo" --include="*.ts" .` — confirmar que código não referencia
2. `grep "nome_completo" prisma/migrations/` — confirmar que não há referência histórica
3. Remover do `schema.prisma`
4. `npx prisma migrate dev --name drop-nome_completo`
5. Testar localmente
6. Deploy em staging, depois prod

## Migração de Dependência Major

### Pré-checks

- Leia CHANGELOG da nova versão (breaking changes)
- Procure por migration guide oficial
- Rode em projeto separado (branch) primeiro
- Verifique deprecation de APIs que você usa

### Processo

1. Crie branch `chore/dep-<lib>-<versao>`
2. Atualize `package.json`
3. Rode `npm install`
4. Aplique fixes de breaking changes (compile errors primeiro)
5. Rode suite de testes
6. Corrija testes que falham
7. Rode smoke test E2E
8. Documente mudanças no CHANGELOG
9. PR com review (mudança arriscada)
10. Deploy com monitoring ativo

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Vou remover logo, ninguém usa" | Sem métrica, é achismo. Meça antes. |
| "Migração é só rename, simples" | Rename sem migration planejada = produção quebrada. |
| "Vou fazer tudo num commit" | Migração por fases = rollback possível. Big bang = sem volta. |
| "Header Deprecation é exagero" | Header é o aviso oficial (RFC 8594). Sem ele, cliente não sabe. |
| "Schema migration roda em prod direto" | Migration não testada em staging = downtime garantido. |

## Red Flags

- Remoção sem aviso prévio
- Migração sem janela de coexistência
- Breaking change sem ADR
- Schema migration sem backup/teste
- Remover coluna sem confirmar zero uso
- Dependência major sem testar em staging
- Sem header `Deprecation` no recurso antigo
- Sem log de uso do recurso antigo (sem métrica)

## Verificação

- [ ] ADR documentando depreciação
- [ ] Header `Deprecation: true` e `Sunset: <data>`
- [ ] Log server-side de uso do recurso antigo
- [ ] Coexistência: novo funciona, antigo continua funcionando
- [ ] Métrica de uso do antigo registrada
- [ ] Janela de tempo ≥ 2 releases / 3 meses
- [ ] Migração testada em staging antes de prod
- [ ] Changelog atualizado
- [ ] Comunicação a stakeholders
- [ ] Remoção apenas quando < 1% de uso
