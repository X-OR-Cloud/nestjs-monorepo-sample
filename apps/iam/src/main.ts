import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IamModule } from './iam.module';

async function bootstrap() {
  const app = await NestFactory.create(IamModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001);
  console.log('IAM Service is running on port 3001');
}
bootstrap();
