import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTaskListDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  list_name?: string;
}
