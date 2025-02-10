import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignUpUserDto, SignInUserDto } from '../users/dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  async register(@Body() signUpUserDto: SignUpUserDto) {
    return this.authService.register(signUpUserDto);
  }

  @Post('/sign-in')
  async login(@Body() signInUserDto: SignInUserDto) {
    return this.authService.login(signInUserDto);
  }

  @Post('/refresh')
  async refreshToken(@Body('refresh_token') token: string) {
    return this.authService.refreshToken(token);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body('userId') userId: number, @Headers('authorization') authorization: string) {
    return this.authService.logout(userId, authorization);
  }
}
