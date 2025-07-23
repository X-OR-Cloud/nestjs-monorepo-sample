import { BaseEntity } from '../../../../../libs/shared/src/entities';

export class Transaction extends BaseEntity {
  amount: number;
  type: 'expense' | 'income';
  description?: string;

  constructor(partial: Partial<Transaction>) {
    super(partial);
    Object.assign(this, partial);
    
    // Set transaction-specific metadata
    this.setMetadata('transactionType', this.type);
    this.setMetadata('transactionAmount', this.amount);
  }

  // Business methods
  getDisplayAmount(): string {
    return this.type === 'expense' ? `-$${this.amount}` : `+$${this.amount}`;
  }

  isIncome(): boolean {
    return this.type === 'income';
  }

  isExpense(): boolean {
    return this.type === 'expense';
  }
}
