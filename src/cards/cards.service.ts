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
import { ReorderCardDto } from './dto/recorder.card.dto';
import { TaskList } from 'src/task-list/entities/task-list.entity';
import { CacheService } from '../redis/cache.service';
import { CacheKeys } from '../common/cache-keys.enum';
import {
  CreateCardResponse,
  DeleteCardResponse,
  UpdateCardResponseData,
} from './interfaces/responses.interface';

@Injectable()
export class CardsService {
  private readonly cacheTaskList = CacheKeys.TASK_LIST;
  private readonly cacheKeyTasksWithCards = CacheKeys.TASKS_WITH_CARDS;

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}

  async createCard(
    dto: CreateCardDto,
    userId: number,
  ): Promise<CreateCardResponse> {
    try {
      const lastCard = await this.cardRepository.findOne({
        where: { task: { id: dto.task_id } },
        order: { position: 'DESC' },
      });

      const newCard: Card = this.cardRepository.create({
        ...dto,
        title: dto.title,
        task: { id: dto.task_id } as TaskList,
        position: lastCard ? lastCard.position + 1 : 0,
        creator: { id: userId } as User,
      });

      const savedCard = await this.cardRepository.save(newCard);

      await this.cacheService.delete(this.cacheTaskList);
      await this.cacheService.delete(this.cacheKeyTasksWithCards);

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
      throw new InternalServerErrorException(error, 'Failed to create card');
    }
  }

  async updateCard(
    dto: UpdateCardDto,
    cardId: number,
  ): Promise<UpdateCardResponseData> {
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
        card.assignee = this.userRepository.create({
          id: dto.assigned_to,
        } as User);
      }

      const updated = await this.cardRepository.save(card);

      await this.cacheService.delete(this.cacheTaskList);
      await this.cacheService.delete(this.cacheKeyTasksWithCards);

      return {
        card_id: updated.id,
        title: updated.title,
        status: updated.status,
        position: updated.position,
        taskId: updated.task?.id ?? null,
        priority: updated.priority,
        assigned_to: updated.assignee?.id ?? null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error, 'Failed to update card');
    }
  }

  async deleteCardById(id: number): Promise<DeleteCardResponse> {
    try {
      const card = await this.cardRepository.findOneBy({ id });
      if (!card) {
        throw new NotFoundException('Card not found');
      }

      await this.cardRepository.remove(card);

      await this.cacheService.delete(this.cacheTaskList);
      await this.cacheService.delete(this.cacheKeyTasksWithCards);

      return {
        message: 'Card deleted successfully',
        data: {
          cardId: card.id,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete card');
    }
  }

  async reorderCards(dto: ReorderCardDto): Promise<{ message: string }> {
    try {
      const {
        card_id,
        sourceTaskId,
        destinationTaskId,
        oldPosition,
        newPosition,
      } = dto;

      const card = await this.cardRepository.findOne({
        where: { id: card_id },
      });

      if (!card) throw new NotFoundException('Card not found');

      const isSameList = sourceTaskId === destinationTaskId;

      if (isSameList) {
        if (newPosition === oldPosition)
          return { message: 'No change required' };

        if (newPosition > oldPosition) {
          await this.cardRepository
            .createQueryBuilder()
            .update(Card)
            .set({ position: () => '"position" - 1' })
            .where('"task_id" = :taskId', { taskId: sourceTaskId })
            .andWhere('"position" > :oldPos AND "position" <= :newPos', {
              oldPos: oldPosition,
              newPos: newPosition,
            })
            .execute();
        } else {
          await this.cardRepository
            .createQueryBuilder()
            .update(Card)
            .set({ position: () => '"position" + 1' })
            .where('"task_id" = :taskId', { taskId: sourceTaskId })
            .andWhere('"position" >= :newPos AND "position" < :oldPos', {
              oldPos: oldPosition,
              newPos: newPosition,
            })
            .execute();
        }

        card.position = newPosition;
        await this.cacheService.delete(this.cacheTaskList);
        await this.cacheService.delete(this.cacheKeyTasksWithCards);
        await this.cardRepository.save(card);

        return { message: 'Card moved successfully' };
      } else {
        await this.cardRepository
          .createQueryBuilder()
          .update(Card)
          .set({ position: () => '"position" - 1' })
          .where('"task_id" = :sourceTaskId AND "position" > :oldPosition', {
            sourceTaskId,
            oldPosition,
          })
          .execute();

        await this.cardRepository
          .createQueryBuilder()
          .update(Card)
          .set({ position: () => '"position" + 1' })
          .where(
            '"task_id" = :destinationTaskId AND "position" >= :newPosition',
            {
              destinationTaskId,
              newPosition,
            },
          )
          .execute();

        card.task = { id: destinationTaskId } as TaskList;
        card.position = newPosition;
        await this.cacheService.delete(this.cacheTaskList);
        await this.cacheService.delete(this.cacheKeyTasksWithCards);
        await this.cardRepository.save(card);

        return { message: 'Card moved successfully' };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reorder cards');
    }
  }
}
