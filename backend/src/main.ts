import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  WinstonLogger,
  winstonLogger,
} from './common/logger/winston.logger';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useBodyParser('json', { limit: '4mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '4mb' });
  app.useLogger(new WinstonLogger());
  app.use(requestIdMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
        },
      },
    }),
  );
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const corsOrigin = configService.getOrThrow<string>('corsOrigin');
  const allowedOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MicroCart API')
    .setDescription(
      [
        'Simple e-commerce API with hard limits: **max 100 products** and **max 1000 clients**. Payments use UPI.',
        '',
        '### Authentication',
        '1. `POST /auth/register` or `POST /auth/login` to receive a JWT.',
        '2. Click **Authorize** and paste the token (without the `Bearer ` prefix).',
        '3. Protected routes send `Authorization: Bearer <token>`.',
        '',
        'Admins are created with `npm run seed:admin` (or promoted with `PUT /users/:id`).',
        '',
        '### Limits',
        '- `POST /products` returns `409` once 100 active products exist.',
        '- `POST /auth/register` returns `403` once 1000 client accounts exist.',
        '',
        '### Mock UPI flow',
        '1. `POST /cart/items` to fill the cart.',
        '2. `POST /cart/checkout` re-checks stock and returns a pending payment with a `upi://` link.',
        '3. Render the link as a QR code; `POST /payments` simulates settlement and clears the cart.',
        '4. `GET /payments/:id` polls the status.',
        '',
        '### Errors',
        'Every error uses the shape `{ statusCode, message, errors }`.',
        '',
        '### Rate limits',
        '100 requests/minute per IP by default; `POST /auth/login` is limited to 5/minute.',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Paste the JWT returned by login or register.',
    })
    .addTag('Auth', 'Registration, login, and current user')
    .addTag('Users', 'Admin-only user management')
    .addTag('Products', 'Public catalog and admin product management')
    .addTag('Cart', 'Authenticated cart and checkout')
    .addTag('Payments', 'Mock UPI payments and provider webhook')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'MicroCart API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);

  winstonLogger.info({
    message: 'MicroCart API started',
    port,
    docs: `http://localhost:${port}/docs`,
  });
}

bootstrap().catch((error: unknown) => {
  winstonLogger.error({
    message: 'Failed to start MicroCart API',
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
