import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { RolesGuard } from '../roles/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UsersService, RolesGuard, JwtService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
