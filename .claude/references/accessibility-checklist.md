---
name: accessibility-checklist
description: Checklist de acessibilidade WCAG AA. Carregue ao criar componente UI ou página em pedi-ai-app, ou em auditoria de a11y.
---

# Checklist de Acessibilidade (A11y)

PediAI busca **WCAG 2.1 AA** no mínimo. Esta checklist cobre os pontos mais importantes para revisão rápida.

## Percepção

### Contraste de Cor

- [ ] Texto normal: contraste ≥ 4.5:1
- [ ] Texto grande (≥ 18pt ou 14pt bold): contraste ≥ 3:1
- [ ] Componentes de UI: contraste ≥ 3:1
- [ ] Estados de hover/focus com contraste adequado
- [ ] Não depender só de cor para transmitir informação (ex: erro)

**Verificar:** Chrome DevTools → Elements → "Accessibility" tab → Contrast.

### Texto

- [ ] Sem texto em imagem (a menos que seja logo)
- [ ] Texto redimensionável até 200% sem quebra
- [ ] Line-height ≥ 1.5
- [ ] Letter-spacing ≥ 0.12em (em texto justificado)
- [ ] Espaçamento de parágrafo ≥ 2x line-height

### Mídia

- [ ] Imagens com `alt` descritivo
- [ ] `alt=""` (vazio) em imagens decorativas
- [ ] Vídeos com legendas
- [ ] Áudios com transcrição

## Operação

### Keyboard

- [ ] Toda funcionalidade acessível via teclado
- [ ] Tab order lógico (sem `tabindex > 0`)
- [ ] `Esc` fecha modal, dropdown, menu
- [ ] `Enter`/`Space` ativam botões
- [ ] Setas navegam em menu/listbox
- [ ] Foco visível em todos os focusables (outline ou ring)

### Touch

- [ ] Alvos de toque ≥ 44x44 px (recomendação WCAG 2.5.5)
- [ ] Espaçamento entre alvos ≥ 8px

### Gestures

- [ ] Funcionalidade também acessível por tap/clique (não só swipe)
- [ ] Movimento/paralaxe pode ser desabilitado

## Compreensão

### Linguagem

- [ ] Idioma principal declarado (`<html lang="pt-BR">`)
- [ ] Mudanças de idioma marcadas (`<span lang="en">`)
- [ ] Linguagem clara e simples
- [ ] Siglas explicadas na primeira ocorrência

### Navegação

- [ ] Breadcrumb em hierarquia profunda
- [ ] Múltiplas formas de encontrar página (menu + busca)
- [ ] Foco gerenciado em SPA navigation
- [ ] Skip link ("Pular para conteúdo") no topo

### Formulários

- [ ] Todo input com `<label>` (não placeholder)
- [ ] Labels descritivos (não "Campo 1")
- [ ] Mensagens de erro associadas (`aria-describedby`)
- [ ] Validação em tempo real (não só no submit)
- [ ] Agrupamento lógico (`<fieldset>` + `<legend>`)
- [ ] Indicação de campos obrigatórios (`aria-required`)

## Robustez

### ARIA

- [ ] Roles explícitos quando semântico (`role="navigation"`)
- [ ] `aria-label` em botão só com ícone
- [ ] `aria-live` em região que atualiza dinamicamente (toast, contagem)
- [ ] `aria-expanded` em disclosure (dropdown, accordion)
- [ ] `aria-modal="true"` em modal
- [ ] Sem ARIA redundante (ex: `<button role="button">`)

### Estrutura

- [ ] Hierarquia de headings correta (h1 → h2 → h3, sem pular)
- [ ] Apenas um `<h1>` por página
- [ ] Listas usam `<ul>`/`<ol>`/`<dl>` (não texto com bullets)
- [ ] Tabelas com `<th>` (cabeçalho) e `scope`
- [ ] Landmark roles (header, nav, main, footer)

### Compatibilidade

- [ ] Funciona em screen readers (NVDA, VoiceOver)
- [ ] Funciona com zoom 200%
- [ ] Funciona com prefers-reduced-motion
- [ ] Funciona com prefers-color-scheme (light/dark)

## Componentes PediAI

### Button (de `src/components/ui/`)

```tsx
// ✅ Certo
<Button variant="primary" onClick={...}>
  Salvar
</Button>

// ✅ Certo (ícone com label)
<Button aria-label="Fechar" onClick={...}>
  <X aria-hidden="true" />
</Button>
```

### Input

```tsx
// ✅ Certo
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-help"
    aria-invalid={hasError}
  />
  <span id="email-help">Use seu email de cadastro</span>
</div>
```

### Modal

```tsx
// ✅ Certo
<dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirmar exclusão</h2>
  ...
</dialog>
```

### Toast / Notificação

```tsx
// ✅ Certo
<div role="status" aria-live="polite">
  Salvo com sucesso
</div>

// Para erros
<div role="alert" aria-live="assertive">
  Erro ao salvar
</div>
```

## Ferramentas de Auditoria

| Ferramenta | Tipo | Uso |
|------------|------|-----|
| **Lighthouse** | Browser | Auditoria automatizada (A11y ≥ 95) |
| **axe DevTools** | Extensão | Análise detalhada de violations |
| **WAVE** | Extensão | Visualização de issues |
| **Screen reader** | NVDA / VoiceOver | Teste manual real |
| **Color contrast checker** | Online | Verificar contraste específico |
| **Keyboard only** | Manual | Navegar sem mouse |

## Comandos

```bash
# Lighthouse (auditoria completa)
npx lighthouse <url> --view

# Lighthouse só a11y
npx lighthouse <url> --only-categories=accessibility --view
```

## Checklist Pré-Merge (UI)

- [ ] Lighthouse Accessibility ≥ 95
- [ ] Navegação por teclado testada (Tab, Shift+Tab, Enter, Esc)
- [ ] Screen reader testado (pelo menos navegação básica)
- [ ] Contraste verificado
- [ ] Hierarquia de headings correta
- [ ] Imagens com `alt` apropriado
- [ ] Forms com labels
- [ ] Modais com `aria-modal` e foco gerenciado
- [ ] Toasts com `aria-live`
- [ ] `prefers-reduced-motion` respeitado (animações desabilitam)
- [ ] `prefers-color-scheme` respeitado (se tema dark)
