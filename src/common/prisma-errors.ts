import { Prisma } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

/**
 * Mapeia erros conhecidos do Prisma para exceções HTTP semânticas.
 *
 * P2002 — Unique constraint violation: o cliente tentou inserir/atualizar um
 * registro com um valor que viola uma constraint UNIQUE. Deve ser reportado
 * como 409 Conflict, não como 500.
 *
 * P2025 — Record not found: usado em update/delete para sinalizar que a
 * operação não encontrou o registro alvo. Vira 404 Not Found.
 */
export function handlePrismaError(
  error: unknown,
  conflictMessage: string,
  notFoundMessage?: string,
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException(conflictMessage);
    }
    if (error.code === 'P2025' && notFoundMessage) {
      throw new NotFoundException(notFoundMessage);
    }
  }
  throw error;
}
