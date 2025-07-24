import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Account } from './entities/account.entity';
import { UserRegisterEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class AccountService {
  private accounts: Account[] = [];

  async createDefaultAccount(userId: string, username: string): Promise<Account> {
    console.log('Creating default account for user:', username);
    const account = new Account({
      balance: 0,
      owner: {
        userId: userId,
        orgId: 'default-org',
      },
    });
    
    // Set account-specific attributes
    account.setAttribute('accountType', 'savings');
    account.setAttribute('currency', 'USD');
    account.setAttribute('status', 'active');
    account.setMetadata('createdByEvent', 'user.registered');
    account.setMetadata('initialBalance', 0);
    account.setMetadata('username', username);
    
    this.accounts.push(account);
    console.log('Default account created:', account.id);
    return account;
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
