// create-task-list.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateTaskListDto {
  @ApiProperty()
  @IsString()
  @Length(3, 35)
  list_name: string;
}
