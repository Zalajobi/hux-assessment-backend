import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '@typeorm/entity/user';
import { Contacts } from '@typeorm/entity/contacts';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from '@lib/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Contacts],
  migrations: [User, Contacts],
  subscribers: [],
});
