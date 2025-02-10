import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './user.entity';
import { SignUpUserDto, SignInUserDto } from './dtos';
import * as bcrypt from 'bcryptjs';

import { RoleEnum, ROLE_NAMES } from '../constants/users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async countUsers(): Promise<number> {
    return await this.usersRepository.count();
  }

  async create(signUpUserDto: SignUpUserDto): Promise<User> {
    const hashedPassword = bcrypt.hashSync(signUpUserDto.password, 10);
    const user = this.usersRepository.create({
      ...signUpUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async setSeniorRole(userId: number) {
    return this.usersRepository.update(
      { id: userId },
      { roleId: RoleEnum.SENIOR },
    );
  }

  async setUserRole(userId: number, roleId: number) {
    if (userId === RoleEnum.SENIOR) {
      throw new BadRequestException('Cannot change the role for this user');
    }

    if (!ROLE_NAMES[roleId]) {
      throw new BadRequestException('The role specified is not valid');
    }

    const updating: UpdateResult = await this.usersRepository.update(
      { id: userId },
      { roleId: roleId },
    );

    return {
      message: `Set up role ${roleId} for user ${userId}`,
      status: Boolean(updating?.affected),
    };
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async findByNickName(nickName: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nickName } });
  }

  async validateUser(loginUserDto: SignInUserDto): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { nickName: loginUserDto.nickName },
    });
    if (user && bcrypt.compareSync(loginUserDto.password, user.password)) {
      return user;
    }
    return null;
  }
}
