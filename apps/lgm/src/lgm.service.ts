import { Injectable } from '@nestjs/common';

@Injectable()
export class LgmService {
  getHello(): string {
    return 'Hello World!';
  }
}
