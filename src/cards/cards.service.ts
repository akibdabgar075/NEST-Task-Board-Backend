import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { UpdateCardDto } from './dto/update-card.dto';
import { User } from '../../src/auth/entities/user.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cardRepository: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createCard(dto: CreateCardDto, userId: number) {
    try {
      const lastCard = await this.cardRepository.findOne({
        where: { task: { id: dto.task_id } },
        order: { position: 'DESC' },
      });

      const newCard = this.cardRepository.create({
        ...dto,
        title: dto.title,
        task: { id: dto.task_id },
        position: lastCard ? lastCard.position + 1 : 0,
        creator: { id: userId },
      });

      const savedCard = await this.cardRepository.save(newCard);

      return {
        message: 'Card created successfully.',
        data: {
          card_id: savedCard.id,
          title: savedCard.title,
          task_id: dto.task_id,
          position: savedCard.position,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to update task positions',
      );
    }
  }

  async updateCard(dto: UpdateCardDto, cardId: number) {
    try {
      const card = await this.cardRepository.findOne({
        where: { id: cardId },
      });

      if (!card) {
        throw new NotFoundException(`Card with ID ${cardId} not found`);
      }

      card.title = dto.title ?? card.title;
      card.description = dto.description ?? card.description;
      card.due_date = dto.due_date ?? card.due_date;
      card.priority = dto.priority ?? card.priority;
      card.status = dto.status ?? card.status;

      if (dto.assigned_to) {
        card.assignee = this.userRepository.create({ id: dto.assigned_to });
      }

      const updated = await this.cardRepository.save(card);

      return {
        card_id: updated.id,
        title: updated.title,
        status: updated.status,
        position: updated.position,
        taskId: updated.task?.id,
        priority: updated.priority,
        assigned_to: updated?.assignee?.id || null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error, 'Failed to card update');
    }
  }

  async deleteCardById(id: number): Promise<{ message: string; data: any }> {
    try {
      const card = await this.cardRepository.findOneBy({ id });
      if (!card) {
        throw new NotFoundException('Task not found');
      }

      await this.cardRepository.remove(card);

      return {
        message: 'Task deleted successfully',
        data: { card_id: card.id },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
