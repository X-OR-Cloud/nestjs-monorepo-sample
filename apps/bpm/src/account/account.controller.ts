import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';
import { Account } from './entities/account.entity';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getAccounts(@CurrentUser() user: any): Promise<Account[]> {
    return this.accountService.findByUserId(user.userId);
  }
}
