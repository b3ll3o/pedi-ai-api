import { RestauranteEntity } from '../../src/restaurante/domain/entities/restaurante.entity';

describe('RestauranteEntity', () => {
  const validCnpj = '45381763000168'; // CNPJ válido

  describe('criação', () => {
    it('deve criar restaurante com dados válidos', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68', // será formatado para 45381763000168
        email: 'teste@restaurante.com',
        telefone: '11999999999',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      const restaurante = new RestauranteEntity(data);

      expect(restaurante.nome).toBe(data.nome);
      expect(restaurante.cnpj).toBe('45381763000168');
      expect(restaurante.email).toBe(data.email);
      expect(restaurante.ativo).toBe(true);
    });

    it('deve criar restaurante sem email e telefone opcionais', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      const restaurante = new RestauranteEntity(data);

      expect(restaurante.nome).toBe(data.nome);
      expect(restaurante.email).toBeNull();
      expect(restaurante.telefone).toBeNull();
    });

    it('deve criar restaurante com estado em maiúsculas', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'sp',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      const restaurante = new RestauranteEntity(data);

      expect(restaurante.estado).toBe('SP');
    });
  });

  describe('validação de CNPJ', () => {
    it('deve lançar erro quando CNPJ é inválido', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '12345678901234', // CNPJ com dígitos verificadores errados
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      expect(() => new RestauranteEntity(data)).toThrow('CNPJ inválido');
    });

    it('deve lançar erro quando CNPJ está em formato inválido (menos digits)', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '1234567890', // apenas 10 dígitos
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      expect(() => new RestauranteEntity(data)).toThrow('CNPJ inválido');
    });

    it('deve lançar erro quando CNPJ é formado por números repetidos', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '11.111.111/1111-11', // todos iguais
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      expect(() => new RestauranteEntity(data)).toThrow('CNPJ inválido');
    });
  });

  describe('validação de horário', () => {
    it('deve lançar erro quando horário abertura >= fechamento', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '22:00',
        horarioFechamento: '09:00', // fechamento antes da abertura
      };

      expect(() => new RestauranteEntity(data)).toThrow(
        'Horário de abertura deve ser anterior ao fechamento',
      );
    });

    it('deve lançar erro quando horário abertura = fechamento', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '09:00', // igual
      };

      expect(() => new RestauranteEntity(data)).toThrow(
        'Horário de abertura deve ser anterior ao fechamento',
      );
    });
  });

  describe('validação de estado', () => {
    it('deve lançar erro quando estado tem mais de 2 caracteres', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SPA', // 3 caracteres inválido
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      expect(() => new RestauranteEntity(data)).toThrow('Estado deve ter exatamente 2 caracteres');
    });

    it('deve lançar erro quando estado tem 1 caractere', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'S', // 1 caractere inválido
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      expect(() => new RestauranteEntity(data)).toThrow('Estado deve ter exatamente 2 caracteres');
    });
  });

  describe('validação de CEP', () => {
    it('deve aceitar CEP em formato válido', () => {
      const data = {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      };

      const restaurante = new RestauranteEntity(data);
      expect(restaurante.cep).toBe('01234-567');
    });
  });
});
