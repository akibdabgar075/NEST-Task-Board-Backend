import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from './user-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
    email: string;
  };
}

export const AuthUser = createParamDecorator(
  (_data: UserPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
