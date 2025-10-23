import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../infra/database/entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/../infra/database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
};

export const AppDataSource = new DataSource(typeormConfig);
