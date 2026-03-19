import { User } from '../entities/user.entity';
import { LoginResponse } from '../interfaces/responses.interface';

export class UserMapper {
  static toAuthResponse(user: User, token: string): LoginResponse {
    void user;
    return {
      message: 'Login successful',
      data: {
        token,
      },
    };
  }
}

