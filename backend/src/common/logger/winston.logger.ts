import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';

export const winstonLogger: Logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: 'microcart-api' },
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [new transports.Console()],
});

@Injectable()
export class WinstonLogger implements LoggerService {
  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  private write(
    level: 'info' | 'error' | 'warn' | 'debug' | 'verbose',
    message: unknown,
    optionalParams: unknown[],
  ): void {
    const context =
      optionalParams.length > 0
        ? { context: optionalParams[optionalParams.length - 1] }
        : {};

    if (typeof message === 'object' && message !== null) {
      winstonLogger.log(level, { ...(message as object), ...context });
      return;
    }

    winstonLogger.log(level, { message: String(message), ...context });
  }
}
