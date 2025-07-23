import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(['expense', 'income'])
  type: 'expense' | 'income';

  @IsOptional()
  @IsString()
  description?: string;
}
