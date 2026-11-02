import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { winstonLogger } from '../logger/winston.logger';
import { RequestWithId } from '../interfaces/request-with-id.interface';

interface ErrorBody {
  statusCode: number;
  message: string;
  errors: string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const body = exceptionResponse as Record<string, unknown>;
        const rawMessage = body.message;

        if (Array.isArray(rawMessage)) {
          message = 'Validation failed';
          errors = rawMessage.map((item) => String(item));
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else {
          message = exception.message;
        }

        if (Array.isArray(body.errors)) {
          errors = body.errors.map((item) => String(item));
        }
      }
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      winstonLogger.error({
        message: 'Request failed',
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode,
        error: exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      winstonLogger.warn({
        message: 'Request rejected',
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode,
        error: message,
      });
    }

    const body: ErrorBody = { statusCode, message, errors };
    response.status(statusCode).json(body);
  }
}
