import { Injectable } from '@nestjs/common';

@Injectable()
export class BpmService {
  getHello(): string {
    return 'Hello World!';
  }
}
