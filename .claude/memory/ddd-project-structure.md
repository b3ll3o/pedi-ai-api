---
name: ddd-project-structure
description: Projeto deve seguir Domain-Driven Design (DDD) com camadas de Domínio, Aplicação, Infraestrutura e Apresentação
metadata:
  type: feedback
---

## Regra: Padrão DDD Obrigatório

O projeto DEVE seguir arquitetura DDD (Domain-Driven Design) com a seguinte estrutura de camadas:

### Estrutura de Camadas

1. **Domínio (Domain)**
   - `src/domain/entities/` - Entidades do domínio
   - `src/domain/value-objects/` - Value Objects
   - `src/domain/interfaces/` - Interfaces de repositórios (contratos)
   - `src/domain/services/` - Serviços de domínio (lógica de negócio pura)
   - Sem dependências de frameworks ou infraestrutura

2. **Aplicação (Application)**
   - `src/application/usecases/` - Casos de uso
   - `src/application/dto/` - DTOs de entrada/saída
   - `src/application/mappers/` - Mappers entre domínio e DTOs

3. **Infraestrutura (Infrastructure)**
   - `src/infrastructure/repositories/` - Implementações de repositórios
   - `src/infrastructure/database/` - Prisma, adapters
   - `src/infrastructure/services/` - Serviços externos

4. **Apresentação (Presentation)**
   - `src/presentation/controllers/` - Controllers (NestJS)
   - `src/presentation/guards/` - Guards, filters, interceptors

### Regras de Dependência
- Domínio NÃO pode depender de nenhuma outra camada
- Application pode depender de Domain
- Infrastructure pode depender de Domain e Application
- Presentation pode depender de todas as camadas

### Por que:
DDD garante separação clara de responsabilidades, facilita testes, manutenção e evolução do código. O domínio permanece limpo e independente de frameworks.

### Como aplicar:
- Ao criar nova feature, começar pelo Domínio
- Controllers apenas recebem/retornam dados, não têm lógica de negócio
- Casos de uso orchestrating a lógica de domínio