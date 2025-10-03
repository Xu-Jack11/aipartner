import { IsEmail, IsString, MinLength } from "class-validator";

const PASSWORD_MIN_LENGTH = 8;

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password!: string;
}
