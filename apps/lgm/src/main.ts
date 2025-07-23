import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { LgmModule } from './lgm.module';

async function bootstrap() {
  const app = await NestFactory.create(LgmModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3003);
  console.log('LGM Service is running on port 3003');
}
bootstrap();
