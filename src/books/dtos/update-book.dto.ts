import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateBookDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  publication_date?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hard_cover?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  newsprint?: boolean;
}
