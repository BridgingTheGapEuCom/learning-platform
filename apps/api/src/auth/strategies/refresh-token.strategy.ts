import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../dto/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies as Record<string, string> | undefined;
          if (!data) return null;
          return data.refresh_token || null;
        },
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    };

    /**
     * Calls the super constructor with the defined strategy options.
     */
    super(options);
  }

  /**
   * Validates the refresh token and retrieves the associated user.
   * This method is called by Passport.js after the JWT refresh token has been successfully decoded.
   * It extracts the refresh token from the request cookies, finds the user by the subject (sub) from the payload,
   * and attaches the refresh token to the user object before returning it.
   *
   * @param req The original Express request object, containing cookies.
   * @param payload The decoded JWT payload, containing the user's subject (sub).
   * @returns A user object augmented with the refresh token, or throws an UnauthorizedException.
   * @throws UnauthorizedException If the user associated with the payload's subject is not found.
   */
  async validate(req: Request, payload: JwtPayload) {
    const cookies = req.cookies as Record<string, string>;
    const refreshToken = cookies.refresh_token;

    const user = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      refreshToken,
    };
  }
}
