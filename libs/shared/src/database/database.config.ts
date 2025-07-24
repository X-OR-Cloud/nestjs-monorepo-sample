import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => {
  return {
    uri: configService.get<string>('MONGODB_URI'),
  };
};
