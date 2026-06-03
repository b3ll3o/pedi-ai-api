/**
 * Helper de paginação compartilhado pelos endpoints de listagem.
 *
 * Sem cap, um `GET /users` em um banco com 100k registros derruba o
 * servidor (OOM no Node) e bloqueia a connection pool do Prisma. Os
 * defaults aqui limitam a 20 itens por página, que é o padrão da maioria
 * das UIs de admin. Clients que precisem de mais podem passar `?pageSize`
 * até o teto de 100.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  skip: number;
  take: number;
}

export function parsePagination(
  pageRaw?: string | number,
  pageSizeRaw?: string | number,
): PaginationParams {
  const page = Math.max(1, Number.parseInt(String(pageRaw ?? 1), 10) || 1);
  const requested = Number.parseInt(String(pageSizeRaw ?? DEFAULT_PAGE_SIZE), 10);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requested || DEFAULT_PAGE_SIZE));
  return { skip: (page - 1) * pageSize, take: pageSize };
}
