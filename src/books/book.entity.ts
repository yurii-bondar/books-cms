import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, GraphQLISODateTime, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('books')
@Index('unique_book', ['name', 'author', 'publication_date'], { unique: true })
export class Book {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  author: string;

  @Column({ type: 'timestamp' })
  @Field()
  publication_date: string;

  @Column({ type: 'boolean', default: false })
  @Field()
  hard_cover: boolean;

  @Column({ type: 'boolean', default: false })
  @Field()
  newsprint: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  add_date: string;
}
