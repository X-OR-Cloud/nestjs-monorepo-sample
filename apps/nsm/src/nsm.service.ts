import { Injectable } from '@nestjs/common';

@Injectable()
export class NsmService {
  getHello(): string {
    return 'Hello World!';
  }
}
