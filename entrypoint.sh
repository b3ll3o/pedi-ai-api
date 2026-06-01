#!/bin/sh
set -e

echo "Aguardando banco de dados estar pronto..."

# Aguardar o PostgreSQL respondendo na porta 5432
until nc -z postgres 5432 2>/dev/null; do
  echo "Aguardando postgres na porta 5432..."
  sleep 1
done

echo "Banco de dados pronto."
echo "DATABASE_URL: $DATABASE_URL"

echo "Aplicando schema..."
npx prisma db push --force-reset --url "$DATABASE_URL"

echo "Executando seed..."
node dist/prisma/seed-e2e.js

echo "Iniciando aplicação..."
exec node dist/src/main.js