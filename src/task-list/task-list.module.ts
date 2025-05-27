import { Module } from '@nestjs/common';
import { TaskListService } from './task-list.service';
import { TaskListController } from './task-list.controller';
import { TaskList } from './entities/task-list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskList]), RedisModule],
  controllers: [TaskListController],
  providers: [TaskListService],
})
export class TaskListModule {}
