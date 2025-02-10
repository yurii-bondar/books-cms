import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import {
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto, CreateBooksDto } from './dtos';
import { Book } from './book.entity';
import { BooksResponse } from './books-response.entity';
import { RoleEnum } from '../constants/users';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  private static readonly allRoles = [
    RoleEnum.SENIOR,
    RoleEnum.MIDDLE,
    RoleEnum.JUNIOR,
    RoleEnum.TRAINEE,
  ];

  @Query(() => BooksResponse)
  @Roles(...BooksResolver.allRoles)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBooks(
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('limit', { defaultValue: 10 }) limit: number,
    @Args('name', { nullable: true }) name: string,
    @Args('author', { nullable: true }) author: string,
    @Args('publicationYear', { nullable: true }) publicationYear: number,
    @Args('sortBy', { defaultValue: 'add_date' }) sortBy: string,
    @Args('sortOrder', { defaultValue: 'DESC' }) sortOrder: string,
    @Context() ctx: any,
  ): Promise<BooksResponse> {
    const token = ctx.token;
    if (!token) throw new UnauthorizedException('Bad access token');

    return this.booksService.getBooks(
      page,
      limit,
      name,
      author,
      publicationYear,
      sortBy,
      sortOrder,
      token,
    );
  }

  @Mutation(() => Book)
  @Roles(RoleEnum.SENIOR, RoleEnum.MIDDLE, RoleEnum.JUNIOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createBook(
    @Args('input') createBookDto: CreateBookDto,
    @Context() ctx?: any,
  ): Promise<Book> {
    const token = ctx.token;
    if (!token) throw new UnauthorizedException('Bad access token');

    return this.booksService.create(token, createBookDto);
  }

  @Mutation(() => [Book])
  @Roles(RoleEnum.SENIOR, RoleEnum.MIDDLE, RoleEnum.JUNIOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createBooks(
    @Args('input') createBooksDto: CreateBooksDto,
    @Context() ctx: any,
  ) {
    const token = ctx.token;
    if (!token) throw new UnauthorizedException('Bad access token');

    return this.booksService.createMultiple(token, createBooksDto.books);
  }

  @Mutation(() => Book)
  @Roles(RoleEnum.SENIOR, RoleEnum.MIDDLE, RoleEnum.JUNIOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateBook(
    @Args('id') id: number,
    @Args('input') updateBookDto: UpdateBookDto,
    @Context() ctx: any,
  ): Promise<Book> {
    const token = ctx.token;
    if (!token) throw new UnauthorizedException('Bad access token');

    return this.booksService.update(token, id, updateBookDto);
  }

  @Mutation(() => Boolean)
  @Roles(RoleEnum.SENIOR, RoleEnum.MIDDLE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteBook(
    @Args('id') id: number,
    @Args('reason') reason: string,
    @Context() ctx: any,
  ): Promise<boolean> {
    const token = ctx.token;
    if (!token) throw new UnauthorizedException('Bad access token');

    if (!reason) {
      throw new BadRequestException('You must provide a reason for deletion');
    }
    return this.booksService.delete(token, id, reason);
  }
}
