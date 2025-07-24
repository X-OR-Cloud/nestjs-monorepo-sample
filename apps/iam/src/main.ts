import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IamModule } from './iam.module';

async function bootstrap() {
  const app = await NestFactory.create(IamModule);
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('IAM Service API')
    .setDescription('Identity and Access Management Service - Handles user authentication and authorization')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
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
    customSiteTitle: 'IAM Service API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(3001);
  console.log('IAM Service is running on port 3001');
  console.log('Swagger docs available at: http://localhost:3001/api/docs');
}
bootstrap();
