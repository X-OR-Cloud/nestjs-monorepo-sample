import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ 
  collection: 'users',
  timestamps: true 
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

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

  markAsChanged(): void {
    // Mongoose handles this automatically with timestamps
  }

  setMetadata(key: string, value: any): void {
    if (!this.metadata) this.metadata = {};
    this.metadata[key] = value;
    this.markModified('metadata');
  }

  getMetadata(key: string): any {
    return this.metadata?.[key];
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
