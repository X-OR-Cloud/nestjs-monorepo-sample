import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BpmModule } from './bpm.module';

async function bootstrap() {
  const app = await NestFactory.create(BpmModule);
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('BPM Service API')
    .setDescription('Business Process Management Service - Handles accounts and transactions')
    .setVersion('1.0')
    .addTag('accounts', 'Account management')
    .addTag('transactions', 'Transaction processing')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'BPM Service API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(3002);
  console.log('BPM Service is running on port 3002');
  console.log('Swagger docs available at: http://localhost:3002/api/docs');
}
bootstrap();
