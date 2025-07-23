import { Controller, Get } from '@nestjs/common';
import { LgmService } from './lgm.service';

@Controller()
export class LgmController {
  constructor(private readonly lgmService: LgmService) {}

  @Get()
  getHello(): string {
    return this.lgmService.getHello();
  }
}
