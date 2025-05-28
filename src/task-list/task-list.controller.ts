import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ConflictException,
  Get,
  Put,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskListService } from './task-list.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';

import { AuthUser } from '../auth/auth-user.decorator';
import { UserPayload } from '../auth/user-payload.interface';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';

import { UpdateTaskListDto } from './dto/update-task-list.dto';

import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateTaskPositionsDto } from './dto/update-task-positions.dto';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@Controller('task')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class TaskListController {
  constructor(private readonly taskListService: TaskListService) {}

  @Post('create-task-list')
  @ApiBody({ type: CreateTaskListDto })
  async createTaskList(
    @Body() dto: CreateTaskListDto,
    @AuthUser() user: UserPayload,
  ) {
    const exists = await this.taskListService.findOneByName(dto?.list_name);
    if (exists) {
      throw new ConflictException('Given Task Name already exists.');
    }

    return await this.taskListService.createTaskList(
      dto.list_name,
      user.userId,
    );
  }

  @Get('get-all-task-list')
  getAllTaskList() {
    return this.taskListService.findAllTask();
  }

  @Put(':task_id/update-task-name')
  @ApiOperation({ summary: 'Update Task name' })
  async updateTaskName(
    @Param('task_id') task_id: number,

    @Body() updateTaskNameDto: UpdateTaskListDto,
  ) {
    const updatedTask = await this.taskListService.updateTaskName(task_id, {
      list_name: updateTaskNameDto.list_name,
    });

    return updatedTask;
  }

  @Put('update-positions')
  @ApiOperation({ summary: 'Bulk update task positions' })
  // @ApiOkResponse({
  //   description: 'Positions updated successfully',
  //   schema: { example: { updatedCount: 5 } },
  // })
  async updatePositions(
    @Body() dto: UpdateTaskPositionsDto,
  ): Promise<{ updatedCount: number }> {
    try {
      return this.taskListService.bulkUpdatePositions(dto);
    } catch (error) {
      console.error('Error in bulkUpdatePositions:', error);
      throw new InternalServerErrorException('Failed to update task positions');
    }
  }

  @Delete(':task_id/delete-task')
  async deleteTask(@Param('task_id', ParseIntPipe) task_id: number) {
    try {
      return await this.taskListService.deleteTaskById(task_id);
    } catch (error) {
      console.error('Error in Task deletion:', error);
      throw new InternalServerErrorException('Failed to delete task ');
    }
  }

  @Get('tasks-with-cards')
  getTasksWithCards() {
    return this.taskListService.getTasksWithCards();
  }
}
