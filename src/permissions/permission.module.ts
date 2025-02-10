import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  // providers: [UsersService],
  // controllers: [UsersController],
  exports: [Permission],
})
export class PermissionModule {}
