import { parsePagination, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../src/common/pagination';

describe('parsePagination', () => {
  describe('caminho feliz', () => {
    it('deve usar defaults quando ambos params são undefined', () => {
      const result = parsePagination();
      expect(result).toEqual({ skip: 0, take: DEFAULT_PAGE_SIZE });
    });

    it('deve calcular skip a partir de page > 1', () => {
      const result = parsePagination('3', '10');
      expect(result).toEqual({ skip: 20, take: 10 });
    });

    it('deve aceitar números diretamente', () => {
      const result = parsePagination(2, 50);
      expect(result).toEqual({ skip: 50, take: 50 });
    });

    it('deve aplicar MAX_PAGE_SIZE como teto', () => {
      const result = parsePagination('1', '500');
      expect(result.take).toBe(MAX_PAGE_SIZE);
    });
  });

  describe('edge cases (cobre branches de fallback)', () => {
    it('deve cair em page=1 quando pageRaw é NaN ("abc")', () => {
      const result = parsePagination('abc', '10');
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('deve cair em page=1 quando pageRaw é número negativo', () => {
      const result = parsePagination('-5', '10');
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('deve cair em page=1 quando pageRaw é "0"', () => {
      const result = parsePagination('0', '10');
      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('deve cair em pageSize=DEFAULT quando pageSizeRaw é NaN', () => {
      const result = parsePagination('1', 'xyz');
      expect(result).toEqual({ skip: 0, take: DEFAULT_PAGE_SIZE });
    });

    it('deve cair em pageSize=DEFAULT quando pageSizeRaw é "0"', () => {
      const result = parsePagination('1', '0');
      expect(result).toEqual({ skip: 0, take: DEFAULT_PAGE_SIZE });
    });

    it('deve respeitar pageSize mínimo de 1 quando pageSizeRaw é negativo', () => {
      const result = parsePagination('1', '-5');
      expect(result).toEqual({ skip: 0, take: 1 });
    });

    it('deve respeitar pageSize=1 (mínimo válido)', () => {
      const result = parsePagination('1', '1');
      expect(result).toEqual({ skip: 0, take: 1 });
    });
  });
});
