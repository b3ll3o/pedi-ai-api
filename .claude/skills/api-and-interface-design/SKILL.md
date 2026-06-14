---
name: api-and-interface-design
description: Projetar APIs limpas, consistentes e evoluíveis. Use ao criar novo endpoint, novo recurso REST, ou padronizar interface. Use antes de implementar, ao revisar design de API.
---

# Design de API e Interface

## Visão Geral

API é contrato. Mudar depois é caro (quebra clientes, requer versionamento, vira débito). Esta skill implementa o baseline REST + NestJS + Prisma para PediAI, garantindo consistência e evolução.

## Quando Usar

- Ao criar novo endpoint
- Ao adicionar rota nova em recurso existente
- Ao padronizar responses de erro
- Em revisão de design antes de implementação
- Ao integrar com cliente externo
- Ao expor API pública

## Princípios REST PediAI

### Verbos HTTP

| Verbo | Uso | Idempotente |
|-------|-----|-------------|
| `GET` | Leitura | Sim |
| `POST` | Criação, ações não-idempotentes | Não |
| `PUT` | Substituição completa | Sim |
| `PATCH` | Atualização parcial | Sim* |
| `DELETE` | Remoção (soft delete no PediAI) | Sim |

*Patched com cuidado: cliente deve enviar apenas campos a mudar.

### Paths

- **Recursos no plural:** `/restaurants`, `/users`, `/perfis`
- **Sub-recursos:** `/perfis/:id/permissoes`
- **Ações:** `/auth/login`, `/auth/refresh` (verbo na URL é exceção para ações não-CRUD)
- **Sem verbo no path:** `GET /restaurants` (não `GET /getRestaurants`)

### Status Codes

| Família | Uso PediAI |
|---------|------------|
| `2xx` | Sucesso |
| `200` | OK (GET, PATCH) |
| `201` | Created (POST com criação) |
| `204` | No Content (DELETE) |
| `4xx` | Erro do cliente |
| `400` | Validação (DTO falhou) |
| `401` | Não autenticado |
| `403` | Autenticado sem permissão |
| `404` | Recurso não existe |
| `409` | Conflito (CNPJ duplicado, etc) |
| `5xx` | Erro do servidor |
| `500` | Erro inesperado (deve ter log) |

### Versionamento

PediAI está em pré-1.0 e não versiona API no path. **Quando chegar a hora:**

- Prefira versionar no path (`/api/v1/restaurants`) ou header (`Accept: application/vnd.pedi-ai.v1+json`)
- Documente breaking changes
- Mantenha v1 funcionando até deprecation completa

## Estrutura de Response

### Sucesso (objeto único)

```json
{
  "data": {
    "id": "uuid",
    "nome": "Restaurante X",
    "cnpj": "12.345.678/0001-90",
    "createdAt": "2026-06-10T12:00:00Z"
  }
}
```

### Lista paginada

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "totalPages": 5
  }
}
```

### Endpoints de Contagem (`GET /<recurso>/count`)

Retornam **diretamente** o objeto `{ total }` (sem wrapper `{ data }`) para ficar fácil de consumir no frontend sem desempacotar:

```json
{ "total": 42 }
```

Aplique a todos os domínios: `/users/count`, `/perfis/count`, `/permissoes/count`, `/restaurants/count`. Todos ADMIN.

### Erro

```json
{
  "statusCode": 400,
  "message": "CNPJ inválido",
  "error": "Bad Request",
  "details": [
    { "field": "cnpj", "constraint": "isCnpj" }
  ]
}
```

PediAI já tem `HttpExceptionFilter` global em `src/common/filters/` que padroniza esse shape.

## Padrões NestJS + Prisma

### Controller

```typescript
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@RolesDecorators(Roles.ADMIN)
export class RestaurantesController {
  constructor(private readonly criarRestaurante: CriarRestauranteUseCase) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateRestauranteDto) {
    return { data: await this.criarRestaurante.execute(dto) };
  }
}
```

### Use Case

```typescript
@Injectable()
export class CriarRestauranteUseCase {
  constructor(
    @Inject(IRESTAURANTES_REPOSITORY)
    private readonly repo: IRestaurantesRepository,
  ) {}

  async execute(input: CreateRestauranteInput): Promise<Restaurante> {
    // 1. Validar regras de domínio
    // 2. Persistir via repository
    // 3. Retornar
  }
}
```

### DTO

```typescript
export class CreateRestauranteDto {
  @IsString()
  @Length(1, 100)
  nome!: string;

  @IsString()
  @IsCNPJ()  // custom validator
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  endereco!: string;

  // ...
}
```

## Convenções de Path no PediAI

- `/auth/*` — autenticação
- `/users` (inglês), `/perfis` (português), `/permissoes` (português), `/restaurants` (inglês)
- **Inconsistência histórica mantida** — não mexer sem combinar (ver `pedi-ai-api/CLAUDE.md`)
- Novos recursos: decida idioma no `spec-driven-development` e mantenha

## Validação de Params e Segurança

- **Todos os params `:id` em controllers** devem usar `ParseUUIDPipe`:

  ```typescript
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) { ... }
  ```

  Sem isso, UUIDs malformados (`/users/abc`) viram 500 em vez de 400 (Prisma lança erro de casting que o filtro global transforma em 500).

- **Ordem das rotas no NestJS importa:** rotas estáticas (`/count`, `/me`) devem ser declaradas **antes** das dinâmicas (`:id`), senão o `:id` faz match com a string estática.

- **JWT:** sempre explicitar `algorithms: ['HS256']` no `passport-jwt` para defesa contra `alg: none` e algorithm confusion. Incluir `jti` no payload (necessário para revogação por logout via `revoked_jtis`). Ver `.claude/skills/auth/SKILL.md`.

## Documentação

Use OpenAPI/Swagger. NestJS tem `@nestjs/swagger` com decorators. PediAI deve ter:

- `@ApiTags('restaurantes')` no controller
- `@ApiOperation({ summary: 'Criar restaurante' })` em cada rota
- `@ApiResponse({ status: 201, type: RestauranteResponseDto })` em cada rota
- DTOs com `@ApiProperty()` em cada campo

Swagger gerado automaticamente disponível em `/api/docs` (configurar em `main.ts`).

## Racionalizações Comuns

| Racionalização | Realidade |
|---|---|
| "Endpoint é só pra mim, tanto faz o shape" | "Só pra mim" dura até o próximo cliente. Contrato é contrato. |
| "Vou padronizar depois" | Padronizar 50 endpoints é refactor massivo. Padronizar 1 é trivial. |
| "Status 200 em tudo é mais simples" | 200 em tudo esconde erros. Cliente não consegue reagir corretamente. |
| "Path com verbo é mais claro" | GET /getUsers viola REST. Use substantivo no path. |
| "Versionar agora é overkill" | Versionar no início é 1 linha. Versionar 50 endpoints depois é migração. |
| "Não preciso de OpenAPI" | OpenAPI = cliente gerado, testes, docs. Custo baixo, valor alto. |

## Red Flags

- Path com verbo (`/getRestaurants`)
- Status code errado (200 em erro, 201 em GET)
- Response sem wrapper `{ data: ... }` (inconsistente)
- Erro sem `statusCode` (cliente não consegue parsear)
- DTO sem validação (`class-validator`)
- Sem `@ApiTags`/`@ApiOperation` (sem docs Swagger)
- Endpoint sem `JwtAuthGuard` (exceto os 4 públicos documentados)
- Falta de paginação em listagem
- Sem soft delete (DELETE apaga de verdade)
- `GET /recurso/count` ausente (dashboard vai buscar lista inteira só para contar)
- `:id` sem `ParseUUIDPipe` (UUIDs malformados viram 500)
- Rota estática (`/count`) declarada depois de `:id` no controller (vai dar 404 ou match errado)

## Verificação

- [ ] Path no plural, sem verbo
- [ ] Verbo HTTP correto (GET, POST, PATCH, DELETE)
- [ ] Status code correto (201 em criação, 204 em delete, etc)
- [ ] Response no shape `{ data: ... }` (sucesso) ou padronizado (erro)
- [ ] DTO com `class-validator`
- [ ] `@UseGuards(JwtAuthGuard)` (exceto públicos)
- [ ] `@RolesDecorators` em endpoints admin
- [ ] Paginação em listagens (`?page=X&perPage=Y`)
- [ ] Soft delete em vez de hard delete
- [ ] OpenAPI decorators (Swagger)
- [ ] Teste E2E cobrindo caminho feliz + 1 erro
- [ ] Params `:id` com `ParseUUIDPipe`
- [ ] `GET /<recurso>/count` exposto (se o recurso é listado no dashboard)
