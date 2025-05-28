import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ReorderCardDto {
  @ApiProperty()
  @IsNumber()
  card_id: number;
  @ApiProperty()
  @IsNumber()
  sourceTaskId: number;
  @ApiProperty()
  @IsNumber()
  destinationTaskId: number;
  @ApiProperty()
  @IsNumber()
  oldPosition: number;
  @ApiProperty()
  @IsNumber()
  newPosition: number;
}
