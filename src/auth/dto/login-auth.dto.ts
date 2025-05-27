import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'akib.dabgar@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'Testing@123' })
  @IsString()
  password: string;
}
