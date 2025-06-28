import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { ShortUrl } from './short-url/short-url.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  synchronize: false, 
  logging: true,
  entities: [User, ShortUrl],
  migrations: ['src/migrations/*.ts'],
});
