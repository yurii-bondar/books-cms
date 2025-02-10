import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/book.module';
import { DynamoDBService } from './dynamodb/dynamodb.service';
import { Test, TestingModule } from '@nestjs/testing';

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
      envFilePath: 'env/test.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_DB_HOSTNAME'),
        port: configService.get('POSTGRES_DB_PORT'),
        username: configService.get('POSTGRES_DB_USERNAME'),
        password: configService.get('POSTGRES_DB_PASSWORD'),
        database: configService.get('POSTGRES_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [User, Role, Permission, Book],
      }),
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
  providers: [
    AppService,
    DynamoDBService
  ],
})
export class TestAppModule {
  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async onModuleInit() {
    await this.dynamoDBService.initializeTables();
  }
}

describe('TestAppModule', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    const appInstance = app.createNestApplication();
    await appInstance.init();
    expect(appInstance).toBeDefined();
  });
});