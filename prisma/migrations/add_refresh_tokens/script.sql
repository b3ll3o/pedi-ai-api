-- Migration: Add RefreshToken model for JWT auth
-- Created manually due to Prisma config issues with remote database

-- Create refresh_tokens table
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" VARCHAR(512) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_token_key" UNIQUE ("token"),
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- Create index on token for faster lookups during refresh
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- Create index on expires_at for cleanup of expired tokens
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");
