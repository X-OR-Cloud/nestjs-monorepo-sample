import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NsmModule } from './nsm.module';

async function bootstrap() {
  const app = await NestFactory.create(NsmModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3004);
  console.log('NSM Service is running on port 3004');
}
bootstrap();
