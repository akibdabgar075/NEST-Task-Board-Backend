import { IsEmail, IsNumber, IsString } from 'class-validator';

export class UserPayload {
  @IsNumber()
  userId: number;

  @IsString()
  username: string;

  @IsEmail()
  email: string;
}
