// user-ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const emailToSearch = request.query.email;

    // Allow if user is admin
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Allow if user is searching their own email
    return user.email === emailToSearch;
  }
}
