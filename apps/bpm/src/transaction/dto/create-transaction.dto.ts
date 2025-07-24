import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction amount',
    example: 100.50,
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: ['expense', 'income'],
    example: 'income'
  })
  @IsEnum(['expense', 'income'])
  type: 'expense' | 'income';

  @ApiProperty({
    description: 'Optional transaction description',
    example: 'Salary payment',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}
