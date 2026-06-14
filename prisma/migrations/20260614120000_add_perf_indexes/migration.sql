Loaded Prisma config from prisma.config.ts.

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "restaurantes_deleted_at_idx" ON "restaurantes"("deleted_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_perfil_id_idx" ON "users"("perfil_id");

