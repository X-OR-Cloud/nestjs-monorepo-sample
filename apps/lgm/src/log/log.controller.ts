import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';
import { Log } from './entities/log.entity';

@ApiTags('logs')
@ApiBearerAuth('JWT-auth')
@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user logs',
    description: 'Retrieve all logs related to the authenticated user activities across all services'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user logs retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
          userId: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5b' },
          eventType: { type: 'string', example: 'user.registered' },
          serviceName: { type: 'string', example: 'IAM' },
          message: { type: 'string', example: 'User registered successfully' },
          data: { type: 'object', example: { username: 'testuser' } },
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
  async getLogs(@CurrentUser() user: any): Promise<Log[]> {
    return this.logService.findByUserId(user.userId);
  }
}
