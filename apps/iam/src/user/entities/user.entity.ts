import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseEntity } from '../../../../../libs/shared/src/entities';

@Schema({ collection: 'users' })
export class User extends BaseEntity {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  constructor(partial: Partial<User>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
