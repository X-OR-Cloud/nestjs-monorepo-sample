import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Account } from './entities/account.entity';
import { UserRegisterEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class AccountService {
  private accounts: Account[] = [];

  @OnEvent('user-register')
  async handleUserRegister(event: UserRegisterEvent) {
    console.log('Creating account for user:', event.username);
    const account = new Account({
      balance: 0,
      owner: {
        userId: event.userId,
        orgId: 'default-org',
      },
    });
    
    // Set account-specific attributes
    account.setAttribute('accountType', 'default');
    account.setAttribute('currency', 'USD');
    account.setMetadata('createdByEvent', 'user-register');
    account.setMetadata('initialBalance', 0);
    
    this.accounts.push(account);
    console.log('Account created:', account);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return this.accounts.filter(account => 
      account.owner.userId === userId && !account.isDeleted()
    );
  }

  async findByUserIdAndOrgId(userId: string, orgId: string): Promise<Account[]> {
    return this.accounts.filter(account => 
      account.owner.userId === userId && 
      account.owner.orgId === orgId && 
      !account.isDeleted()
    );
  }

  async updateBalance(userId: string, amount: number, type: 'expense' | 'income'): Promise<void> {
    const userAccounts = await this.findByUserId(userId);
    if (userAccounts.length > 0) {
      const account = userAccounts[0]; // Use first account for simplicity
      
      if (type === 'income') {
        account.deposit(amount);
      } else {
        account.withdraw(amount);
      }
      
      account.setMetadata('lastTransactionType', type);
      account.setMetadata('lastTransactionAmount', amount);
      account.setMetadata('lastTransactionDate', new Date());
    }
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accounts.filter(account => !account.isDeleted());
  }

  async getAccountById(accountId: string): Promise<Account | undefined> {
    return this.accounts.find(account => 
      account.id === accountId && !account.isDeleted()
    );
  }
}
