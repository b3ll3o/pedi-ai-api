# Pedi-AI API — Specification-Driven Development

Este projeto segue a metodologia **OpenSpec**. Todo trabalho de feature começa com especificações.

## Workflow SDD

1. **Spec first** — Toda mudança começa com uma spec em `openspec/specs/`
2. **Proposals** — Mudanças significativas usam `openspec/changes/<feature>/proposal.md`
3. **Design** — Decisões técnicas documentadas em `openspec/changes/<feature>/design.md`
4. **Tasks** — Implementação quebrada em `openspec/changes/<feature>/tasks.md`
5. **Specs** — Contratos de API documentados em `openspec/specs/<domain>/spec.md`

## Contexto

- **Stack:** NestJS, TypeScript, Prisma ORM, PostgreSQL
- **API:** REST JSON
- **Padrões:** Repository pattern, DTOs com class-validator
- **Domínio:** Plataforma médica de AI pediátrica

## Estrutura de Diretórios

```
openspec/
├── config.yaml          # Configuração do projeto
├── specs/                # Especificações de API/domínio
│   └── <domain>/
│       └── spec.md
└── changes/             # Propostas de mudança de feature
    └── <feature>/
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/
```

## Regras Obrigatórias

### Regra: Estilo SDD Obrigatório

- **Specs first** - ANTES de escrever código, a especificação DEVE existir em `openspec/specs/`
- **Proposta** - Mudanças significativas DEVEM ter proposta em `openspec/changes/<feature>/proposal.md`
- **Design** - Decisões técnicas DEVEM ser documentadas em `openspec/changes/<feature>/design.md`
- **Tasks** - Implementação DEVE ser quebrada em tarefas em `openspec/changes/<feature>/tasks.md`
- **Specs de API** - Contratos de API DEVEM estar documentados em `openspec/specs/<domain>/spec.md`

### Regra: Idioma

Todo código, comentários, nomes de arquivos e documentação DEVEM estar em **Português Brasileiro (pt-BR)**.

### Regra: Testes

- **Cobertura mínima:** 80%
- **Testes unitários:** TODAS as integrações DEVEM estar cobertas
- **Testes E2E:** TODOS os fluxos da API DEVEM ter testes E2E

### Regra: Critérios de Aceitação

- Implementação SÓ pode começar APÓS spec existir
- Testes DEVEM ser escritos ANTES ou DURANTE a implementação
- Code review DEVE verificar conformidade com spec

## Padrões

- Todos endpoints DEVEM documentar respostas de erro
- Incluir exemplos de request/response em specs
- Mudanças quebrantes requerem uma nova versão da spec