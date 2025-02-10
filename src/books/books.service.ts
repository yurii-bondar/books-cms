import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Book } from './book.entity';
import { BooksResponse } from './books-response.entity';
import { CreateBookDto, UpdateBookDto } from './dtos';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class BooksService {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    @InjectRepository(Book) private booksRepository: Repository<Book>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly dynamoDBService: DynamoDBService,
  ) {}

  private config(key: string) {
    return this.configService.get(key);
  }

  private decodeToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.config('JWT_SECRET'),
    });
  }

  async create(token: string, createBookDto: CreateBookDto): Promise<Book> {
    const book = this.booksRepository.create(createBookDto);
    const user = this.decodeToken(token);
    const savedBook = await this.booksRepository.save(book);

    if (savedBook.id) {
      await this.dynamoDBService.writeLogs(
        this.config('DYNAMO_DB_BOOKS_TABLE'),
        {
          user_id: user.sub,
          book_id: savedBook.id,
          role_id: user.roleId,
          event: 'create',
        },
      );
    }

    return savedBook;
  }

  async createMultiple(
    token: string,
    createBooksDto: CreateBookDto[],
  ): Promise<Book[]> {
    const books = this.booksRepository.create(createBooksDto);
    const user = this.decodeToken(token);
    const savedBooks = await this.booksRepository.save(books);

    if (savedBooks?.length) {
      await Promise.allSettled(
        savedBooks.map(async (book: Book) =>
          this.dynamoDBService.writeLogs(this.config('DYNAMO_DB_BOOKS_TABLE'), {
            user_id: user.sub,
            book_id: book.id,
            role_id: user.roleId,
            event: 'create',
          }),
        ),
      );
    }

    return savedBooks;
  }

  async update(
    token: string,
    id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    const user = this.decodeToken(token);
    const updatedBook = await this.booksRepository.update(id, updateBookDto);

    if (updatedBook?.affected) {
      await this.dynamoDBService.writeLogs(
        this.config('DYNAMO_DB_BOOKS_TABLE'),
        {
          user_id: user.sub,
          book_id: id,
          role_id: user.roleId,
          data: updateBookDto,
          event: 'update',
        },
      );
    }

    return this.booksRepository.findOne({ where: { id } });
  }

  async delete(token: string, id: number, reason: string): Promise<boolean> {
    const result = await this.booksRepository.delete(id);
    const deleted: boolean = Boolean(result.affected);
    const user = this.decodeToken(token);

    if (deleted) {
      await this.dynamoDBService.writeLogs(
        this.config('DYNAMO_DB_BOOKS_TABLE'),
        {
          user_id: user.sub,
          book_id: id,
          role_id: user.roleId,
          data: { reason },
          event: 'delete',
        },
      );
    }

    return deleted;
  }

  async getBooks(
    page = 1,
    limit = 10,
    name: string = '',
    author: string = '',
    publicationYear: number | null = null,
    sortBy: string = 'add_date',
    sortOrder: string = 'DESC',
    token: string,
  ): Promise<BooksResponse> {
    this.decodeToken(token);

    const cacheKey = `books:${page}:${limit}:${name}:${author}:${publicationYear}:${sortBy}:${sortOrder}`;

    const cachedData = await this.redisClient.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const queryBuilder = this.booksRepository.createQueryBuilder('book');

    if (name) queryBuilder.andWhere('book.name LIKE :name', { name: `%${name}%` });
    if (author) {
      queryBuilder.andWhere('book.author LIKE :author', {
        author: `%${author}%`,
      });
    }
    if (publicationYear) {
      queryBuilder.andWhere(
        'EXTRACT(YEAR FROM book.publication_date) = :publicationYear',
        { publicationYear },
      );
    }

    const totalCount = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalCount / limit);

    queryBuilder
      .orderBy(sortBy, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const booksPage = await queryBuilder.getMany();

    const response: BooksResponse = {
      currentPage: page,
      page: booksPage,
      totalPages,
    };

    await this.redisClient.set(
      cacheKey,
      JSON.stringify(response),
      'EX',
      10 * 60,
    );

    return response;
  }
}
