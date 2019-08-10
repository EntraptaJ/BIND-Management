import { User } from '../Models/User';
import { InstanceType } from 'typegoose';

export interface Context {
  user: InstanceType<User> | undefined;
}
