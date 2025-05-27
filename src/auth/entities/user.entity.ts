import { Card } from '../../cards/entities/card.entity';
import { TaskList } from '../../task-list/entities/task-list.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TaskList, (taskList) => taskList.user)
  taskLists: TaskList[];

  @OneToMany(() => Card, (card) => card.creator)
  created_by: Card[];

  @OneToMany(() => Card, (card) => card.assignee)
  assigned_to: Card[];
}
