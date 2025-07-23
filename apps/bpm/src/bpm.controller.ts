import { Controller, Get } from '@nestjs/common';
import { BpmService } from './bpm.service';

@Controller()
export class BpmController {
  constructor(private readonly bpmService: BpmService) {}

  @Get()
  getHello(): string {
    return this.bpmService.getHello();
  }
}
