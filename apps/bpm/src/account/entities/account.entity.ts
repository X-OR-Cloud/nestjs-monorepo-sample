import { BaseEntity } from '../../../../../libs/shared/src/entities';

export class Account extends BaseEntity {
  balance: number;

  constructor(partial: Partial<Account>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Business methods
  deposit(amount: number): void {
    this.balance += amount;
    this.markAsChanged();
    this.setMetadata('lastOperation', 'deposit');
    this.setMetadata('lastOperationAmount', amount);
  }

  withdraw(amount: number): void {
    if (this.balance >= amount) {
      this.balance -= amount;
      this.markAsChanged();
      this.setMetadata('lastOperation', 'withdraw');
      this.setMetadata('lastOperationAmount', amount);
    } else {
      throw new Error('Insufficient balance');
    }
  }
}
