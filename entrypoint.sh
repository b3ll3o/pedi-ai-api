#!/bin/sh
set -e

echo "Aguardando banco de dados estar pronto..."

# Aguardar o PostgreSQL respondendo na porta 5432
until nc -z postgres 5432 2>/dev/null; do
  echo "Aguardando postgres na porta 5432..."
  sleep 1
done

echo "Banco de dados pronto."
# IMPORTANTE: nunca logar DATABASE_URL inteiro em prod — vaza credenciais nos
# logs. Mostra apenas o host para diagnóstico.
echo "DATABASE_URL host: $(echo "$DATABASE_URL" | sed -E 's#.*@([^/]+).*#\1#')"

echo "Aplicando schema..."
# ATENÇÃO: --force-reset APAGA TODOS OS DADOS do banco. Este entrypoint
# foi feito para o container de E2E onde o banco é descartável. Em
# produção real, use `prisma migrate deploy` (gerenciado por migrations).
npx prisma db push --force-reset --url "$DATABASE_URL"

echo "Executando seed..."
node dist/prisma/seed-e2e.js

echo "Iniciando aplicação..."
exec node dist/src/main.js