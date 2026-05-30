-- CreateTable
CREATE TABLE "restaurantes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "cep" TEXT NOT NULL,
    "horarioAbertura" VARCHAR(5) NOT NULL,
    "horarioFechamento" VARCHAR(5) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_cnpj_key" ON "restaurantes"("cnpj");
