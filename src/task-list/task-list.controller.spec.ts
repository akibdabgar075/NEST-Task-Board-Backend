import { Test, TestingModule } from '@nestjs/testing';
import { TaskListController } from './task-list.controller';
import { TaskListService } from './task-list.service';

describe('TaskListController', () => {
  let controller: TaskListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskListController],
      providers: [TaskListService],
    }).compile();

    controller = module.get<TaskListController>(TaskListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
