import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  collection: 'transactions',
  timestamps: true 
})
export class Transaction extends Document {
  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, enum: ['expense', 'income'] })
  type: 'expense' | 'income';

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true })
  userId: string; // Who created this transaction

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata: { [key: string]: any };

  // Virtual methods
  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  markAsDeleted(): void {
    this.deletedAt = new Date();
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

  setTransactionMetadata(key: string, value: any): void {
    if (!this.metadata) this.metadata = {};
    this.metadata[key] = value;
    this.markModified('metadata');
  }

  getTransactionMetadata(key: string): any {
    return this.metadata?.[key];
  }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
