import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(username: string, password: string, orgId?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      email: `${username}@example.com`,
      password: hashedPassword,
    });
    
    return await user.save();
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ 
      username, 
      deletedAt: null 
    }).exec();
    return user || undefined;
  }

  async findById(userId: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ 
      _id: userId, 
      deletedAt: null 
    }).exec();
    return user || undefined;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.userModel.findByIdAndUpdate(
      userId, 
      { ...updates, updatedAt: new Date() }, 
      { new: true }
    ).exec();
    return user || undefined;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndUpdate(
      userId, 
      { deletedAt: new Date() }, 
      { new: true }
    ).exec();
    return !!result;
  }
}
