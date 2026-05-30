import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CriarRestauranteDto,
  AtualizarRestauranteDto,
} from '../../../src/restaurante/application/dto/restaurante.dto';

describe('RestauranteDto', () => {
  describe('CriarRestauranteDto', () => {
    it('deve validar DTO com dados válidos', async () => {
      const dto = plainToInstance(CriarRestauranteDto, {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        email: 'teste@restaurante.com',
        telefone: '11999999999',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('deve falhar com CNPJ em formato inválido', async () => {
      const dto = plainToInstance(CriarRestauranteDto, {
        nome: 'Restaurante Teste',
        cnpj: '1234567890', // formato inválido
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cnpj');
    });

    it('deve falhar com estado com mais de 2 caracteres', async () => {
      const dto = plainToInstance(CriarRestauranteDto, {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SPA', // 3 caracteres inválido
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const estadoError = errors.find((e) => e.property === 'estado');
      expect(estadoError).toBeDefined();
    });

    it('deve falhar com CEP em formato inválido', async () => {
      const dto = plainToInstance(CriarRestauranteDto, {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '12345678', // formato inválido (sem hífen)
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cep');
    });

    it('deve validar com email opcional não informado', async () => {
      const dto = plainToInstance(CriarRestauranteDto, {
        nome: 'Restaurante Teste',
        cnpj: '45.381.763/0001-68',
        endereco: 'Rua teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        horarioAbertura: '09:00',
        horarioFechamento: '22:00',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('AtualizarRestauranteDto', () => {
    it('deve validar DTO com dados válidos para atualização parcial', async () => {
      const dto = plainToInstance(AtualizarRestauranteDto, {
        nome: 'Novo Nome',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('deve falhar com email inválido', async () => {
      const dto = plainToInstance(AtualizarRestauranteDto, {
        email: 'email-invalido',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('deve validar atualização com múltiplos campos', async () => {
      const dto = plainToInstance(AtualizarRestauranteDto, {
        nome: 'Novo Nome',
        telefone: '11988888888',
        ativo: false,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
