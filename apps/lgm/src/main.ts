import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LgmModule } from './lgm.module';

async function bootstrap() {
  const app = await NestFactory.create(LgmModule);
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('LGM Service API')
    .setDescription('Log Management Service - Centralized logging for all microservices')
    .setVersion('1.0')
    .addTag('logs', 'Log management and retrieval')
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
    customSiteTitle: 'LGM Service API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(3003);
  console.log('LGM Service is running on port 3003');
  console.log('Swagger docs available at: http://localhost:3003/api/docs');
}
bootstrap();
