import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialUser } from '@btg/shared-types/dist/interfaces/social-user.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') as string,
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') as string,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;

    if (!emails || emails.length === 0) {
      done(new Error('No email found from Google'), undefined);
      return;
    }

    if (!name?.givenName || !name?.familyName) {
      done(new Error('No name found from Google'), undefined);
      return;
    }

    const user: SocialUser = {
      email: emails[0].value,
      firstName: name?.givenName ? name?.givenName : '',
      lastName: name?.familyName ? name?.familyName : '',
      picture: photos && photos[0] ? photos[0].value : undefined,
      googleId: profile.id,
      accessToken,
    };

    done(null, user);
  }
}
