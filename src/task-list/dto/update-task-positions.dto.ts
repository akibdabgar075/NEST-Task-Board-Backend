import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class TaskPositionDto {
  @ApiProperty({ example: 42 })
  @IsInt()
  task_id: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  position: number;
}

export class UpdateTaskPositionsDto {
  @ApiProperty({
    type: [TaskPositionDto],
  })
  tasks: TaskPositionDto[];
}
