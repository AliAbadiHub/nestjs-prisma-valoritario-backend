import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('VALORITARIO')
    .setDescription('The Shopping Companion API')
    .setVersion('1.0')
    .addTag('Authentication')
    .addBearerAuth()
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
