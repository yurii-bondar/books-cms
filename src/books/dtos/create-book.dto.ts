import { IsString, IsBoolean, IsDateString } from 'class-validator';
import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateBookDto {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  author: string;

  @Field()
  @IsDateString()
  publication_date: string;

  @Field()
  @IsBoolean()
  hard_cover: boolean;

  @Field()
  @IsBoolean()
  newsprint: boolean;
}

@InputType()
export class CreateBooksDto {
  @Field(() => [CreateBookDto])
  books: CreateBookDto[];
}