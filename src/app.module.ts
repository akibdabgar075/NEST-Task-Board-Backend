import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { TaskListModule } from './task-list/task-list.module';
import { TaskList } from './task-list/entities/task-list.entity';
import { CardsModule } from './cards/cards.module';
import { Card } from './cards/entities/card.entity';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: false,
        entities: [User, TaskList, Card],
        logging: true,
      }),
    }),

    TypeOrmModule.forFeature([User, TaskList, Card]),
    AuthModule,
    RedisModule,
    TaskListModule,
    CardsModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
