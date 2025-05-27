import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
    email: string;
  };
}

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
