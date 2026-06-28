import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 4000);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', []);
  const enableSwagger = configService.get<boolean>('app.enableSwagger', true);

  // Health probes stay at the root (/health) for Railway/uptime monitors, and
  // the ECPay callbacks stay at stable, unversioned paths (/payments/webhook,
  // /payments/result) since they're configured in ECPay's merchant portal and
  // hit externally — they must not depend on the internal /api/v1 prefix.
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/ready', 'payments/webhook', 'payments/result'],
  });

  // In development we allow any origin for convenience. In production we only
  // allow the explicit list from CORS_ORIGINS / FRONTEND_URL, and fail closed
  // (deny all cross-origin) if that list was left empty — never reflect-all
  // with credentials enabled.
  app.enableCors({
    origin:
      corsOrigins.length > 0
        ? corsOrigins
        : nodeEnv === 'production'
          ? false
          : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger is enabled outside production; in production set ENABLE_SWAGGER=true
  // to expose it for live inspection / smoke-testing.
  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('PiPiBook API')
      .setDescription('PiPiBook LINE-integrated coach booking platform API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger docs available at /api/docs');
  }

  // Bind to 0.0.0.0 so the container is reachable on Railway / Docker.
  await app.listen(port, '0.0.0.0');
  logger.log(`PiPiBook backend running on port ${port} [${nodeEnv}]`);
}

bootstrap();
