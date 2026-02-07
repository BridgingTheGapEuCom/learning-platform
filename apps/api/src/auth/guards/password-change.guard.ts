import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { SKIP_PASSWORD_CHANGE_KEY } from '../decorators/skip-password-change.decorator';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSkipped = this.reflector.getAllAndOverride<boolean>(
      SKIP_PASSWORD_CHANGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (isSkipped) {
      return true;
    }

    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.mustChangePassword) {
      throw new ForbiddenException({
        message:
          'Security Alert: You must change your password before proceeding.',
        error: 'PasswordChangeRequired',
      });
    }

    return true;
  }
}
