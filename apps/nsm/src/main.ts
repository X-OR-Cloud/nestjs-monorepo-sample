import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NsmModule } from './nsm.module';

async function bootstrap() {
  const app = await NestFactory.create(NsmModule);
  
  // Enable CORS for all origins
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('NSM Service API')
    .setDescription('Notification Service Management - Real-time notifications via WebSocket')
    .setVersion('1.0')
    .addTag('notifications', 'Real-time notification system')
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
    customSiteTitle: 'NSM Service API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(3004);
  console.log('NSM Service is running on port 3004');
  console.log('Swagger docs available at: http://localhost:3004/api/docs');
  console.log('WebSocket server available at: ws://localhost:3004');
}
bootstrap();
