import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErroResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Logar qualquer exceção antes do branching: para 4xx ajuda a entender
    // qual validação/guarda disparou, e para 5xx garante que o stack
    // sempre vai pro log (sem isso, exceções Prisma não tratadas ecoam
    // dados sensíveis ao cliente mas nada fica registrado server-side).
    this.logger.error(
      `${request.method} ${request.url} | type=${exception?.constructor?.name} | message=${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : 'no-stack',
    );

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message: string | string[];

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as ErroResponse;
        message = responseObj.message || 'Erro interno do servidor';
      } else {
        message = 'Erro interno do servidor';
      }

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
      return;
    }

    // Erro não-HttpException (ex: PrismaClientKnownRequestError cru escapou
    // de um use-case sem handlePrismaError). Loga o stack completo server-side
    // para investigação, mas devolve mensagem genérica ao cliente — sem isso
    // o Prisma ecoa nome de campos, schema e às vezes parte da connection
    // string, vazando superfície de ataque.
    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Erro interno do servidor',
    });
  }
}
