import * as bcrypt from 'bcrypt';
import { SenhaHashService } from '../../src/domain/services/senha-hash.service';

jest.mock('bcrypt');

describe('SenhaHashService', () => {
  let service: SenhaHashService;

  beforeEach(() => {
    service = new SenhaHashService();
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('deve gerar hash usando bcrypt com SALT_ROUNDS 10', async () => {
      const senha = 'minhaSenha123';
      const hashEsperado = '$2b$10$hashGerado';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashEsperado);

      const resultado = await service.hash(senha);

      expect(resultado).toBe(hashEsperado);
      expect(bcrypt.hash).toHaveBeenCalledWith(senha, 10);
    });

    it('deve chamar bcrypt.hash apenas uma vez', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      await service.hash('senha');

      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });
  });

  describe('compare', () => {
    it('deve retornar true quando senha corresponde ao hash', async () => {
      const senha = 'senhaCorreta';
      const hash = '$2b$10$hashValido';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const resultado = await service.compare(senha, hash);

      expect(resultado).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(senha, hash);
    });

    it('deve retornar false quando senha não corresponde ao hash', async () => {
      const senha = 'senhaIncorreta';
      const hash = '$2b$10$hashValido';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const resultado = await service.compare(senha, hash);

      expect(resultado).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(senha, hash);
    });
  });
});
