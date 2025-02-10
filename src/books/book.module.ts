import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import { BooksResolver } from './books.resolver';
import { BooksService } from './books.service';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { RolesGuard } from '../roles/roles.guard';
import { AuthModule } from '../auth/auth.module';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), AuthModule, DynamoDBModule],
  providers: [
    BooksService,
    BooksResolver,
    RolesGuard,
    DynamoDBService,
    JwtService,
    RedisModule,
  ],
})
export class BooksModule {}
