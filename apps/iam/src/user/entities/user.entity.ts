import { BaseEntity } from '../../../../../libs/shared/src/entities';

export class User extends BaseEntity {
  username: string;
  password: string;

  constructor(partial: Partial<User>) {
    super(partial);
    Object.assign(this, partial);
  }
}
