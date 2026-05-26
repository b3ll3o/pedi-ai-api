import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockRequest = { url: '/test-endpoint' };

  const createMockArgumentsHost = (): ArgumentsHost => {
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    };
    return host as unknown as ArgumentsHost;
  };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('deve retornar statuscode 200 para HttpException OK', () => {
      const exception = new HttpException('OK', HttpStatus.OK);
      const host = createMockArgumentsHost();

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.OK,
          message: 'OK',
          path: '/test-endpoint',
        }),
      );
    });

    it('deve retornar 404 para NotFoundException', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);
      const host = createMockArgumentsHost();

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('deve extrair mensagem de objeto de resposta', () => {
      const exception = new HttpException(
        { message: ['Validation failed', 'Field is required'] },
        HttpStatus.BAD_REQUEST,
      );
      const host = createMockArgumentsHost();

      filter.catch(exception, host);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ['Validation failed', 'Field is required'],
        }),
      );
    });

    it('deve tratar excecoes nao-HttpException como erro interno', () => {
      const exception = new Error('Database connection failed');
      const host = createMockArgumentsHost();

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro interno do servidor',
        }),
      );
    });

    it('deve incluir timestamp no formato ISO', () => {
      const exception = new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
      const host = createMockArgumentsHost();

      filter.catch(exception, host);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });
});
