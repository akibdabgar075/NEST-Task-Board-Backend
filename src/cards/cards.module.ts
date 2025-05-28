import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/auth/entities/user.entity';
import { Card } from './entities/card.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card, User]), RedisModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
