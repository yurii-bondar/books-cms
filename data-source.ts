import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { Role } from './src/roles/role.entity';
import { Permission } from './src/permissions/permission.entity';
import { Book } from './src/books/book.entity';

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as process from "node:process";

const environment = process.env.NODE_ENV || 'dev';
const envPath = path.resolve(process.cwd(), `env/${environment}.env`);

dotenv.config({ path: envPath });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_DB_HOSTNAME,
  port: Number(process.env.POSTGRES_DB_PORT),
  username: process.env.POSTGRES_DB_USERNAME,
  password: process.env.POSTGRES_DB_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  entities: [User, Role, Permission, Book],
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false,
  logging: environment !== 'test',
});
