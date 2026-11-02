import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'change-me',
  database: process.env.DB_NAME ?? 'microcart',
  charset: 'utf8mb4',
  timezone: 'Z',
  synchronize: false,
  logging: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
