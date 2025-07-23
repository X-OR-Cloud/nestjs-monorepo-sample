import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';
import { Log } from './entities/log.entity';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  async getLogs(@CurrentUser() user: any): Promise<Log[]> {
    return this.logService.findByUserId(user.userId);
  }
}
