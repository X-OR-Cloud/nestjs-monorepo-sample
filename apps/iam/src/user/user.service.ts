import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private users: User[] = [];

  async create(username: string, password: string, orgId?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      owner: {
        userId: '', // Will be set after creation
        orgId: orgId || 'default-org',
      },
    });
    
    // Set the userId to self-reference for users
    user.owner.userId = user.id;
    
    this.users.push(user);
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username && !user.isDeleted());
  }

  async findById(userId: string): Promise<User | undefined> {
    return this.users.find(user => user.id === userId && !user.isDeleted());
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.findById(userId);
    if (user) {
      Object.assign(user, updates);
      user.markAsChanged();
      return user;
    }
    return undefined;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (user) {
      user.markAsDeleted();
      return true;
    }
    return false;
  }
}
