import { IsString } from 'class-validator';

export class SignInUserDto {
  @IsString()
  nickName: string;

  @IsString()
  password: string;
}
