import { IsString, IsEmail, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  firstName: string;

  @IsString()
  secondName: string;

  @IsString()
  nickName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
