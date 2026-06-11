---
name: observability-and-instrumentation
description: Adiciona logging, métricas, e tracing. Use ao debugar em produção, ao criar feature nova, ou antes de deploy. Use para entender comportamento do sistema em prod.
---

# Observabilidade e Instrumentação

## Visão Geral

Em produção, você não tem debugger, não tem console.log, e o bug só aparece às 3h da manhã. Observabilidade (logs, métricas, traces) é o que te permite entender o que aconteceu e por quê. Esta skill implementa o baseline PediAI.

## Quando Usar

- Ao debugar issue em produção
- Ao criar feature nova (instrumentar antes de fechar)
- Antes de deploy (verificar observabilidade)
- Em revisão periódica (trimestral)
- Quando stakeholder pede "relatório de uso"
- Quando tempo de resposta varia sem explicação

## Os 3 Pilares

| Pilar | Responde | Ferramenta PediAI |
|-------|----------|-------------------|
| **Logs** | "O que aconteceu?" | Console (stdout/stderr), `pm2 logs` |
| **Métricas** | "Quanto, com que frequência?" | Prometheus (futuro), stats simples |
| **Traces** | "Por onde passou?" | OpenTelemetry (futuro) |

PediAI hoje é leve: stdout + log estruturado. Pode evoluir para OpenTelemetry sem mudar a skill.

## Logs Estruturados

### Por que estruturado?

Texto livre é difícil de buscar. JSON é queryable:

```json
{
  "timestamp": "2026-06-10T12:34:56.789Z",
  "level": "info",
  "msg": "User logged in",
  "userId": "uuid-xxx",
  "ip": "192.168.0.1",
  "duration_ms": 45
}
```

vs texto livre:
```
[2026-06-10 12:34:56] INFO: User uuid-xxx logged in from 192.168.0.1 in 45ms
```

### Padrão PediAI

Use o logger do NestJS (`Logger` global) com formato consistente:

```typescript
private readonly logger = new Logger(RestaurantesController.name);

async findAll(@CurrentUser() user: User) {
  const start = Date.now();
  try {
    const restaurantes = await this.repo.findAll();
    this.logger.log({
      msg: 'Listar restaurantes',
      userId: user.id,
      count: restaurantes.length,
      duration_ms: Date.now() - start,
    });
    return { data: restaurantes };
  } catch (error) {
    this.logger.error({
      msg: 'Erro ao listar restaurantes',
      userId: user.id,
      error: error.message,
      stack: error.stack,
      duration_ms: Date.now() - start,
    });
    throw error;
  }
}
```

### Níveis de Log

| Nível | Quando | Exemplo |
|-------|--------|---------|
| `error` | Algo falhou que não devia | DB fora, exception não-tratada |
| `warn` | Algo suspeito mas recuperável | Token expirado, retry de fetch |
| `log` / `info` | Eventos de negócio importantes | Login, criação de recurso, mudança de role |
| `debug` | Detalhes para debug (não em prod por default) | Payload, headers |
| `verbose` | Mais detalhe ainda (não em prod) | Cada iteração de loop |

**Produção:** error, warn, info. **Dev:** todos.

## O que Logar

### Sempre logue (negócio)

- Login (sucesso e falha)
- Criação/Atualização/Remoção de recurso
- Mudança de role/permission
- Acesso a dados sensíveis
- Rate limit atingido

### Sempre logue (técnico)

- Erros 5xx (com stack trace)
- Latência de endpoints lentos (> 1s)
- Conexão com dependência externa (DB, Redis, API externa)
- Health check falhando

### NUNCA logue

- Senha (em qualquer formato)
- Token de acesso/refresh completo
- Cookie de sessão
- PII sensível (CPF completo, cartão)
- Segredos (JWT_SECRET, etc)

```typescript
// ❌ NUNCA
this.logger.log(`User ${email} logged in with password ${password}`);

// ✅ Log apenas o necessário
this.logger.log({ msg: 'User logged in', userId: user.id });
```

## Métricas Essenciais

Para PediAI (MVP), as métricas mais valiosas:

| Métrica | Por que | Como medir |
|---------|---------|-----------|
| Latência P95 por endpoint | UX | Middleware de timing |
| Taxa de erro 5xx | Saúde | Error counter |
| Taxa de erro 4xx (por tipo) | UX, ataque | Error counter por status |
| Logins por hora | Uso | Counter |
| Cobertura de testes | Qualidade | CI |
| Tempo de suite E2E | Saúde do pipeline | CI |

**Implementação futura:** Prometheus + Grafana. Por agora, contadores simples em log.

## Health Check

PediAI já tem `@nestjs/terminus` em `src/common/health/`:

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

**Adicione checks** para:
- DB (`pingCheck`)
- Redis se houver
- API externas críticas
- Espaço em disco (se aplicável)

## Tracing Distribuído

**Status PediAI:** não implementado. Roadmap.

Quando implementar (OpenTelemetry):
- Adicionar `traceId` em cada log
- Span em cada request
- Propagação entre api/app/e2e

## Performance Monitoring (Frontend)

Para pedi-ai-app:

| Métrica | Bom | Onde medir |
|---------|-----|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse, Web Vitals |
| **FID/INP** (Interaction to Next Paint) | < 200ms | Web Vitals |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Web Vitals |
| **TTFB** (Time to First Byte) | < 600ms | Network tab |
| **FCP** (First Contentful Paint) | < 1.8s | Lighthouse |

Use `@vercel/analytics` ou similar para produção.

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Console.log resolve" | Console.log polui output, não tem níveis, não tem contexto. Use logger. |
| "Loggar tudo é mais seguro" | Loggar tudo tem custo (I/O, storage) e vaza dados. Loggar certo. |
| "Métricas são infra de SRE" | Métricas simples (counter, gauge) são úteis desde o dia 1. |
| "Health check é cerimônia" | Health check que falha dispara alerta. Sem ele, você descobre quando usuário reclama. |
| "Tracing é overkill" | Tracing ajuda. Mas sem logs e métricas, não. Faça nessa ordem. |
| "Em dev log é diferente" | Em dev, log estruturado também. Não invista em dois formatos. |

## Red Flags

- Senha/token em log
- PII completa (email pode; CPF não)
- Log sem timestamp
- Log sem nível
- Log sem contexto (qual usuário, qual request)
- Stack trace perdido (error sem stack)
- Erro 500 sem log
- Health check sem checar dependências
- Métrica sem label útil
- `console.log` em vez de logger

## Verificação

- [ ] Logger estruturado em uso (não `console.log`)
- [ ] Níveis de log apropriados (error, warn, info)
- [ ] Logs com timestamp, nível, contexto (userId, requestId)
- [ ] Senha/token/PII fora de logs
- [ ] Health check verifica DB e dependências críticas
- [ ] Eventos de negócio logados (login, criação, mudança de role)
- [ ] Erros 5xx logados com stack
- [ ] Latência medida em endpoints lentos
- [ ] Em prod, sem debug/verbose
- [ ] Frontend: Web Vitals medidos
