import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  // providers: [UsersService],
  // controllers: [UsersController],
  exports: [Role],
})
export class RoleModule {}
