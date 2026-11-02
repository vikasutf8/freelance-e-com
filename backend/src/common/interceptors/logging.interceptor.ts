import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RequestWithId } from '../interfaces/request-with-id.interface';
import { winstonLogger } from '../logger/winston.logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<
      RequestWithId & { user?: AuthenticatedUser }
    >();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    const base = {
      requestId: request.requestId,
      method: request.method,
      path: request.originalUrl,
      userId: request.user?.userId,
    };

    winstonLogger.info({ message: 'Incoming request', ...base });

    return next.handle().pipe(
      tap(() => {
        winstonLogger.info({
          message: 'Request completed',
          ...base,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        });
      }),
      catchError((error: unknown) => {
        winstonLogger.error({
          message: 'Request errored',
          ...base,
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        });
        return throwError(() => error);
      }),
    );
  }
}
