import { Controller, Param, Put, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from "../roles/roles.decorator";
import { RoleEnum } from '../constants/users';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('/:id/role/:roleId')
  @Roles(RoleEnum.SENIOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  setRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.usersService.setUserRole(Number(id), Number(roleId));
  }
}
