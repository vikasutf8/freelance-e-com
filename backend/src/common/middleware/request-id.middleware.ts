import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestWithId } from '../interfaces/request-with-id.interface';

export function requestIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const requestId =
    (request.headers['x-request-id'] as string | undefined) ?? randomUUID();
  (request as RequestWithId).requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  next();
}
