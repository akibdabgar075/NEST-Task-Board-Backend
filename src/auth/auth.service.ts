import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import {
  LoginResponse,
  RegisterResponse,
} from './interfaces/responses.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    try {
      const existing = await this.userRepo.findOneBy({ email: dto.email });

      if (existing) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = this.userRepo.create({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      });

      const savedUser = await this.userRepo.save(user);
      const { id, username, email } = savedUser;

      return {
        message: 'User registered successfully',
        data: { id, username, email },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.userRepo.findOneBy({ email: dto.email });

      if (!user) {
        throw new UnauthorizedException('Invalid email');
      }

      const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Invalid password');
      }

      const token = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      return { message: 'Login successfully', data: { token } };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login');
    }
  }
}
