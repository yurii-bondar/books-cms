import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { UsersService } from '../users/users.service';
import { SignInUserDto, SignUpUserDto } from '../users/dtos';
import { User } from '../users/user.entity';
import { SENIOR_USER_ID, ROLE_NAMES } from '../constants/users';
import { REDIS_PREFIX, REFRESH_TOKEN_EXPIRY, REVOKED_ACCESS_TOKEN_EXPIRY } from '../constants/redis';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dynamoDBService: DynamoDBService,
  ) {}

  private config(key: string) {
    return this.configService.get(key);
  }

  async register(
    signUpUserDto: SignUpUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const existingUser = await this.usersService.findByNickName(
      signUpUserDto.nickName,
    );

    if (existingUser)
      throw new BadRequestException('Nickname is already taken');

    const user = await this.usersService.create(signUpUserDto);
    const seniorUserId = user?.id === SENIOR_USER_ID;

    if (seniorUserId) await this.usersService.setSeniorRole(SENIOR_USER_ID);

    return this.generateTokens(user);
  }

  async saveUserSession(user: { id: number; roleId: number }) {
    return this.redisClient.set(
      this.userSessionKey(user.id),
      JSON.stringify({
        user_id: user.id,
        role_id: user.roleId,
        signin_date: new Date().toISOString(),
        logout_date: null,
      }),
    );
  }

  async login(loginUserDto: SignInUserDto): Promise<{
    name: string;
    role: string;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.usersService.findByNickName(loginUserDto.nickName);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.usersService.validateUser(loginUserDto);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);

    await this.saveUserSession(user);

    return {
      name: user.nickName,
      role: ROLE_NAMES[user.roleId],
      ...tokens,
    };
  }

  async refreshToken(
    token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersService.findById(payload.sub);
      const refreshToken = await this.redisClient.get(
        this.refreshTokenKey(payload.sub),
      );

      if (!user || refreshToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private refreshTokenKey(userId: number): string {
    return `${REDIS_PREFIX.REFRESH_TOKEN}:${userId}`;
  }

  private userSessionKey(userId: number): string {
    return `${REDIS_PREFIX.USER_SESSION}:${userId}`;
  }

  private revokedAccessTokenKey(userId: number): string {
    return `${REDIS_PREFIX.REVOKED_ACCESS_TOKEN}:${userId}`;
  }

  async storeRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<string> {
    return this.redisClient.set(
      this.refreshTokenKey(userId),
      refreshToken,
      'EX',
      REFRESH_TOKEN_EXPIRY,
    );
  }

  private async generateTokens(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      username: user.nickName,
      roleId: user.roleId,
      sub: user.id,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.config('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config('JWT_REFRESH_SECRET'),
      expiresIn: '1d',
    });

    await this.storeRefreshToken(user.id, refresh_token);

    return { access_token, refresh_token };
  }

  async logout(userId: number, authHeader: string): Promise<{ message: string }> {
    let accessToken: string = '';

    if (authHeader?.startsWith('Bearer ')) accessToken = authHeader.split(' ')[1];

    const user = await this.usersService.findById(userId);
    if (!user?.nickName) {
      throw new NotFoundException(`User with id:${userId} not found`);
    }

    const tokenRedisKey: string = this.refreshTokenKey(user.id);
    const sessionRedisKey: string = this.userSessionKey(user.id);

    const refreshToken = await this.redisClient.get(tokenRedisKey);
    if (!refreshToken) throw new NotFoundException('User not found');

    const deleted = await this.redisClient.del(tokenRedisKey);

    if (deleted) {
      const userSession: string = await this.redisClient.get(sessionRedisKey);
      const logOutData: { logout_date: string } = {
        logout_date: new Date().toISOString(),
      };

      const logData: object = {};
      if (userSession) {
        Object.assign(logData, JSON.parse(userSession), logOutData);
      }

      await Promise.allSettled([
        this.dynamoDBService.writeLogs(
          this.config('DYNAMO_DB_USERS_TABLE'),
          logData,
        ),
        this.redisClient.del(sessionRedisKey),
        this.redisClient.lpush(this.revokedAccessTokenKey(userId), accessToken),
        this.redisClient.expire(this.revokedAccessTokenKey(userId), REVOKED_ACCESS_TOKEN_EXPIRY)
      ]);
    }

    return { message: 'Successfully logged out' };
  }
}
