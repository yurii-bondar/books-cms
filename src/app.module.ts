import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { join } from 'path';
import { Client } from 'pg';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/book.module';
import { DynamoDBService } from './dynamodb/dynamodb.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './permissions/permission.entity';
import { Book } from './books/book.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'env/dev.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>  {
        await ensureDatabasesExist(configService);
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_DB_HOSTNAME'),
          port: configService.get('POSTGRES_DB_PORT'),
          username: configService.get('POSTGRES_DB_USERNAME'),
          password: configService.get('POSTGRES_DB_PASSWORD'),
          database: configService.get('POSTGRES_DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
          entities: [User, Role, Permission, Book],
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const credentials = `${configService.get('REDIS_USERNAME')}:${configService.get('REDIS_PASSWORD')}`;
        const baseUrl = `${configService.get('REDIS_HOSTNAME')}:${configService.get('REDIS_PORT')}`;
        return {
          type: 'single',
          url: `redis://${credentials}@${baseUrl}`,
        };
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/books/books.schema.gql'),
      context: ({ req }: ExpressContext) => {
        const token = req.headers['authorization']?.split(' ')[1];
        return { token };
      },
    }),
    BooksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, DynamoDBService],
})
export class AppModule {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async onModuleInit() {
    await this.dynamoDBService.initializeTables();
  }
}

async function ensureDatabasesExist(configService: ConfigService) {
  const client = new Client({
    host: configService.get('POSTGRES_DB_HOSTNAME'),
    port: configService.get('POSTGRES_DB_PORT'),
    user: configService.get('POSTGRES_DB_USERNAME'),
    password: configService.get('POSTGRES_DB_PASSWORD'),
    database: 'postgres',
  });

  await client.connect();

  const databasesToCreate = [
    configService.get('POSTGRES_DB_NAME'),
    configService.get('POSTGRES_TEST_DB_NAME'),
  ];

  for (const dbName of databasesToCreate) {
    if (!dbName) {
      console.error('Database name is undefined. Please check your configuration.');
      continue;
    }

    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (result.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      try {
        await client.query(`CREATE DATABASE "${dbName}";`);
        console.log(`Database "${dbName}" created successfully.`);
      } catch (error) {
        console.error(`Error creating database "${dbName}":`, error.message);
      }
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  }

  await client.end();
}

