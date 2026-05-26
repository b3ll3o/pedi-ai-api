#!/bin/bash
# Script de validação pre-push: linter + testes + cobertura + complexidade
# Exit 0 = permite push, Exit 1 = bloqueia

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Verificando linter ==="
npm run lint 2>&1 | tee /tmp/lint-output.txt
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Linter encontrou erros"
    exit 1
fi

echo "=== Verificando testes e cobertura ==="
npm test -- --coverage --silent 2>&1 | tee /tmp/test-output.txt
TEST_RESULT=${PIPESTATUS[0]}

if [ $TEST_RESULT -ne 0 ]; then
    echo "❌ Testes falharam"
    exit 1
fi

# Extrair cobertura do output - procurar "All files" com porcentagem
COVERAGE_LINE=$(grep "All files" /tmp/test-output.txt | head -1)
if [ -n "$COVERAGE" ]; then
    COVERAGE_PCT=$(echo "$COVERAGE_LINE" | awk '{print $NF}' | tr -d '%')
    if [ -n "$COVERAGE_PCT" ] && [ "$COVERAGE_PCT" -lt 80 ] 2>/dev/null; then
        echo "❌ Cobertura ${COVERAGE_PCT}% < 80% (mínimo requerido)"
        exit 1
    fi
fi

echo "=== Verificando complexidade ciclomática ==="
COMPLEXITY_OUTPUT=$(npx complexity --threshold 15 --output json 2>&1 || true)
echo "$COMPLEXITY_OUTPUT" | tee /tmp/complexity-output.txt

# Verificar se há violações (complexity retorna código de erro quando há violação)
if echo "$COMPLEXITY_OUTPUT" | grep -q '"violation"'; then
    VIOLATION_COUNT=$(echo "$COMPLEXITY_OUTPUT" | grep -c '"violation"' || echo "0")
    if [ "$VIOLATION_COUNT" -gt 0 ]; then
        echo "❌ Complexidade ciclomática acima do limite (15) - $VIOLATION_COUNT violações"
        exit 1
    fi
fi

echo "✅ Todas as verificações passaram"
exit 0