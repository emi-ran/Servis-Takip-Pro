import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export class AuthenticatedUser {
  userId: string;
  companyId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
