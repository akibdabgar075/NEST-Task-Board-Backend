/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { TaskListService } from './task-list.service';

describe('TaskListService', () => {
  let service: TaskListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskListService],
    }).compile();

    service = module.get<TaskListService>(TaskListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
