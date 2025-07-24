import { Controller, Get, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user transactions',
    description: 'Retrieve all transactions for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user transactions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
          userId: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5b' },
          amount: { type: 'number', example: 100.50 },
          type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
          description: { type: 'string', example: 'Salary payment' },
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
  async getTransactions(@CurrentUser() user: any): Promise<Transaction[]> {
    return this.transactionService.findByUserId(user.userId);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new transaction',
    description: 'Create a new transaction (income or expense) for the authenticated user'
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Transaction created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5a' },
        userId: { type: 'string', example: '607d2f9e8b8b8b001f5e4d5b' },
        amount: { type: 'number', example: 100.50 },
        type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
        description: { type: 'string', example: 'Salary payment' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing JWT token' 
  })
  async createTransaction(
    @CurrentUser() user: any,
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionService.create(user.userId, createTransactionDto);
  }
}
