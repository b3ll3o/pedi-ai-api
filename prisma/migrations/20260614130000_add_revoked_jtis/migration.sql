-- CreateTable
CREATE TABLE "revoked_jtis" (
    "jti" TEXT NOT NULL,
    "user_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revoked_jtis_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE INDEX "revoked_jtis_expires_at_idx" ON "revoked_jtis"("expires_at");
