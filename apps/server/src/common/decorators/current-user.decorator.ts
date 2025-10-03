import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "../../auth/auth.types";

type RequestWithUser = Request & { user?: AuthUser };

export const CurrentUser = createParamDecorator<
  undefined,
  ExecutionContext,
  AuthUser
>((_data, context) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  if (request.user === undefined) {
    throw new UnauthorizedException("当前请求缺少有效的身份信息");
  }
  return request.user;
});
