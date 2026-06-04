import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const currentUserFactory = (
  data: keyof RequestWithUser['user'] | undefined,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  const user = request.user;

  return data ? user[data] : user;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
