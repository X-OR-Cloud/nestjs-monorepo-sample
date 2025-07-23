import { Controller, Get } from '@nestjs/common';
import { NsmService } from './nsm.service';

@Controller()
export class NsmController {
  constructor(private readonly nsmService: NsmService) {}

  @Get()
  getHello(): string {
    return this.nsmService.getHello();
  }
}
