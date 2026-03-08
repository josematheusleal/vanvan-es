/**
 * Resposta paginada genérica do backend (Spring Page).
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
