import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TaskList } from './entities/task-list.entity';
import { UpdateTaskListDto } from './dto/update-task-list.dto';

import {
  CreateTaskListResponse,
  DeleteTaskResponse,
  TaskCardResult,
  TaskListResponse,
  TaskRows,
} from './interface/task.interface';

import { UpdateTaskPositionsDto } from './dto/update-task-positions.dto';
import { CacheService } from '../redis/cache.service';
import { CacheKeys } from '../common/cache-keys.enum';

@Injectable()
export class TaskListService {
  private readonly cacheTaskList = CacheKeys.TASK_LIST;
  private readonly cacheKeyTasksWithCards = CacheKeys.TASKS_WITH_CARDS;

  constructor(
    @InjectRepository(TaskList)
    private readonly taskListRepo: Repository<TaskList>,
    private readonly cacheService: CacheService,
  ) {}

  async findOneByName(list_name: string): Promise<boolean> {
    const existing = await this.taskListRepo.findOne({ where: { list_name } });
    return !!existing;
  }

  async createTaskList(
    list_name: string,
    user_id: number,
  ): Promise<CreateTaskListResponse> {
    try {
      const lastTask = await this.taskListRepo.findOne({
        where: {},
        order: { position: 'DESC' },
      });

      const task = this.taskListRepo.create({
        list_name,
        user_id,
        position: lastTask ? lastTask.position + 1 : 0,
      });

      const savedTask = await this.taskListRepo.save(task);

      await this.cacheService.delete(this.cacheTaskList);
      await this.cacheService.delete(this.cacheKeyTasksWithCards);

      return {
        message: 'Task created successfully',
        data: {
          task_id: savedTask.id,
          list_name: savedTask.list_name,
          position: savedTask.position,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAllTask(): Promise<TaskListResponse> {
    try {
      const cached = await this.cacheService.get<{
        message: string;
        data: [];
      }>(this.cacheTaskList);
      if (cached) return cached;

      const fetchAllList = await this.taskListRepo.find({
        order: { position: 'ASC' },
        select: ['id', 'list_name', 'position'],
      });

      if (!fetchAllList.length) {
        throw new NotFoundException('No task lists found');
      }

      const filterData = fetchAllList.map((item) => ({
        task_id: item.id,
        list_name: item.list_name,
        position: item.position,
      }));

      const result = {
        message: 'Fetch List successfully',
        data: filterData,
      };

      await this.cacheService.set(this.cacheTaskList, result, 10000);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to fetch task list',
      );
    }
  }

  async updateTaskName(
    id: number,
    updateName: Partial<UpdateTaskListDto>,
  ): Promise<{ message: string; data: {} }> {
    try {
      const task = await this.taskListRepo.findOne({ where: { id } });
      if (!task) throw new NotFoundException('Task list not found');

      task.list_name = updateName.list_name || '';
      await this.taskListRepo.save(task);

      await this.cacheService.delete(this.cacheTaskList);
      await this.cacheService.delete(this.cacheKeyTasksWithCards);

      return {
        message: 'Task name updated successfully',
        data: {
          task_id: task.id,
          list_name: task.list_name,
          position: task.position,
        },
      };
    } catch (error) {
      debugger;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  async bulkUpdatePositions(
    dto: UpdateTaskPositionsDto,
  ): Promise<{ updatedCount: number }> {
    const { tasks } = dto;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new BadRequestException('tasks must be a non-empty array');
    }

    const ids = tasks.map((t) => t.task_id);
    const existing = await this.taskListRepo.find({ where: { id: In(ids) } });

    const updates: Promise<TaskList>[] = [];
    for (const { task_id, position } of tasks) {
      const task = existing.find((t) => t.id === task_id);
      if (task && task.position !== position) {
        task.position = position;
        updates.push(this.taskListRepo.save(task));
      }
    }

    const results = await Promise.all(updates);

    await this.cacheService.delete(this.cacheTaskList);
    await this.cacheService.delete(this.cacheKeyTasksWithCards);

    return { updatedCount: results.length };
  }

  async deleteTaskById(id: number): Promise<DeleteTaskResponse> {
    try {
      const task = await this.taskListRepo.findOneBy({ id });
      if (!task) throw new NotFoundException('Task not found');

      await this.taskListRepo.remove(task);

      await this.cacheService.delete(this.cacheTaskList);
      await this.cacheService.delete(this.cacheKeyTasksWithCards);

      return {
        message: 'Task deleted successfully',
        data: { task_id: task.id },
      };
    } catch {
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  async getTasksWithCards(): Promise<TaskCardResult[]> {
    try {
      const cached = await this.cacheService.get<TaskCardResult[]>(
        this.cacheKeyTasksWithCards,
      );

      if (cached) return cached;

      const result: TaskRows[] = await this.taskListRepo
        .createQueryBuilder('task')
        .leftJoin('task.cards', 'card')
        .leftJoin('task.user', 'user')
        .leftJoin('card.assignee', 'assignee')
        .leftJoin('card.creator', 'creator')
        .select([
          'task.id AS task_id',
          'user.id AS user_id',
          'task.list_name AS list_name',
          'task.position AS task_position',
          'card.id AS card_id',
          'card.title AS card_title',
          'card.description AS card_description',
          'card.due_date AS due_date',
          'card.priority AS priority',
          'card.status AS status',
          'card.position AS card_position',
          'assignee.id AS assignee_to',
          'creator.id AS created_by',
        ])
        .orderBy('task.position', 'ASC')
        .addOrderBy('card.position', 'ASC')
        .getRawMany();

      const tasksObj: Record<number, TaskCardResult> = {};

      for (const row of result) {
        if (!tasksObj[row.task_id]) {
          tasksObj[row.task_id] = {
            task_id: row.task_id,
            user_id: row.user_id,
            list_name: row.list_name,
            position: row.task_position,
            cards: [],
          };
        }

        if (row.card_id) {
          tasksObj[row.task_id].cards.push({
            card_id: row.card_id,
            created_by: row.created_by,
            title: row.card_title,
            description: row.card_description,
            due_date: row.due_date,
            priority: row.priority,
            status: row.status,
            assignee_to: row.assignee_to,
            position: row.card_position,
          });
        }
      }

      const finalResult = Object.values(tasksObj);

      await this.cacheService.set(this.cacheKeyTasksWithCards, finalResult, 0);

      return finalResult;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Failed to fetch tasks with cards',
      );
    }
  }
}
