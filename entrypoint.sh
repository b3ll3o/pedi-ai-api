#!/bin/sh
set -e

echo "Aguardando banco de dados estar pronto..."

# Aguardar o PostgreSQL respondendo na porta 5432
until nc -z postgres 5432 2>/dev/null; do
  echo "Aguardando postgres na porta 5432..."
  sleep 1
done

echo "Banco de dados pronto. Aplicando schema..."
export DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/dev?schema=public"
npx prisma db push --force-reset --url "$DATABASE_URL"

echo "Iniciando aplicação..."
exec node dist/main.js