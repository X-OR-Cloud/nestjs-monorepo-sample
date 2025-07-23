import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { BpmModule } from './bpm.module';

async function bootstrap() {
  const app = await NestFactory.create(BpmModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3002);
  console.log('BPM Service is running on port 3002');
}
bootstrap();
