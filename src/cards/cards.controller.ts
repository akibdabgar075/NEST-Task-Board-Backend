import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCardDto } from './dto/create-card.dto';

import { AuthUser } from '../auth/auth-user.decorator';
import { UserPayload } from '../auth/user-payload.interface';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardsService } from './cards.service';
import { ReorderCardDto } from './dto/recorder.card.dto';

@ApiTags('Cards')
@ApiBearerAuth('access-token')
@Controller('card')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class CardsController {
  constructor(private readonly cardService: CardsService) {}

  @Post('create-card')
  createCardController(
    @Body() dto: CreateCardDto,
    @AuthUser() user: UserPayload,
  ) {
    return this.cardService.createCard(dto, user.userId);
  }

  @Put('update-card/:card_id')
  updateCardController(
    @Body() dto: UpdateCardDto,
    @Param('card_id') card_id: number,
  ) {
    return this.cardService.updateCard(dto, card_id);
  }

  @Delete(':task_id/delete-card')
  async deleteCard(@Param('task_id', ParseIntPipe) task_id: number) {
    return await this.cardService.deleteCardById(task_id);
  }

  @Put('reorder-card')
  async reorderCardController(@Body() dto: ReorderCardDto) {
    return await this.cardService.reorderCards(dto);
  }
}
