import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';
import { Account } from './entities/account.entity';

@ApiTags('accounts')
@ApiBearerAuth('JWT-auth')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user accounts',
    description: 'Retrieve all accounts belonging to the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user accounts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
          userId: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5b' },
          balance: { type: 'number', example: 1000.50 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing JWT token' 
  })
  async getAccounts(@CurrentUser() user: any): Promise<Account[]> {
    return this.accountService.findByUserId(user.userId);
  }
}
