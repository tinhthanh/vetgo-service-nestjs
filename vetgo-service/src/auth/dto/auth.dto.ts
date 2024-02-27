import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// using class-validator AND class-transformer
export class AuthDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
