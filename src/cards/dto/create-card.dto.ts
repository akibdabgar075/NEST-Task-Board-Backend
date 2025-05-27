import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty()
  @IsNumber()
  task_id: number;

  //   @IsNumber()
  //   created_by: number;

  @IsOptional()
  @IsNumber()
  assigned_to?: number;

  @ApiProperty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  due_date?: Date;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
