import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Book } from './book.entity';

@ObjectType()
export class BooksResponse {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => [Book])
  page: Book[];
}
