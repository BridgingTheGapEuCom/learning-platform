import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { CreateSocialUserDto, RegisterDto } from '@btg/shared-types';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'node:crypto';
import { SocialUser } from '@btg/shared-types/dist/interfaces/social-user.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Called once the module has been initialized.
   * It checks the `JWT_SECRET` environment variable for its existence and strength.
   * Logs a critical error if the secret is missing or too weak (less than 32 characters),
   * otherwise logs a success message.
   */
  onModuleInit() {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      this.logger.error('CRITICAL: JWT_SECRET is missing or too weak!');
    } else {
      this.logger.log('✅  Auth Service initialized with secure secrets.');
    }
  }

  /**
   * Validates a user's credentials by checking their email and password.
   *
   * @param email The user's email address.
   * @param pass The user's plain text password.
   * @returns A partial {@link User} object if credentials are valid, or `null` if the user is not found or has no password.
   * @throws {UnauthorizedException} If the user is not found, has no password, or the provided password does not match.
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findUserWithPassword(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    } else if (user.password) {
      const isMatch = await argon2.verify(user.password, pass);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user.toObject() as Partial<User>;
    }

    return null;
  }

  /**
   * Logs in a user by generating access and refresh tokens and updating the user's refresh token hash.
   *
   * @param user The user object to log in.
   * @returns A promise that resolves to an object containing the access and refresh tokens.
   *   - `access_token`: The JWT access token.
   *   - `refresh_token`: The JWT refresh token.
   */
  async login(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.global_role,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Logs out a user by setting their `hashedRefreshToken` to `null`.
   * If the `userId` is provided as a string, it will be converted to a `Types.ObjectId`.
   *
   * @param userId The ID of the user to log out, can be a `Types.ObjectId` or a string.
   * @returns A promise that resolves when the user's refresh token hash has been cleared.
   */
  async logout(userId: Types.ObjectId | string): Promise<void> {
    if (typeof userId === 'string') {
      userId = new Types.ObjectId(userId);
    }
    await this.usersService.update(userId, { hashedRefreshToken: null });
  }

  /**
   * Generates a pair of JWT tokens (access token and refresh token) for a given user.
   *
   * @param userId The unique identifier of the user (Mongoose ObjectId).
   * @param email The email address of the user.
   * @returns A promise that resolves to an object containing the access and refresh tokens.
   *   - `access_token`: The generated JWT access token.
   *   - `refresh_token`: The generated JWT refresh token.
   */
  async getTokens(
    userId: Types.ObjectId,
    email: string,
    firstName: string,
    lastName: string,
    globalRole: string,
  ) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          firstName,
          lastName,
          globalRole,
          iss: 'Bridging The Gap Learning Platform',
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<number>('JWT_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, iss: 'Bridging The Gap Learning Platform' },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRATION'),
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  /**
   * Hashes the provided refresh token and updates the user's `hashedRefreshToken` field in the database.
   *
   * @param userId The unique identifier of the user (Mongoose ObjectId).
   * @param refreshToken The refresh token string to be hashed and stored.
   * @returns A promise that resolves when the user's refresh token hash has been updated.
   */
  async updateRefreshTokenHash(
    userId: Types.ObjectId | string,
    refreshToken: string,
  ) {
    const hash = await argon2.hash(refreshToken);
    if (typeof userId === 'string') {
      userId = new Types.ObjectId(userId);
    }

    await this.usersService.update(userId, { hashedRefreshToken: hash });
  }

  /**
   * Refreshes a user's access and refresh tokens.
   *
   * This method validates the provided refresh token against the stored hashed refresh token for the given user.
   * If valid, it generates a new pair of access and refresh tokens and updates the stored hashed refresh token.
   *
   * @param userId The ID of the user whose tokens are to be refreshed.
   * @param rt The refresh token provided by the user.
   * @returns A promise that resolves to an object containing the new access and refresh tokens.
   *   - `access_token`: The new JWT access token.
   *   - `refresh_token`: The new JWT refresh token.
   * @throws {ForbiddenException} If the user is not found, has no stored refresh token, or the provided refresh token does not match.
   */
  async refreshTokens(
    userId: string,
    rt: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findOneByIdWithRefreshToken(
      new Types.ObjectId(userId),
    );

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const credentialMatches = await argon2.verify(user.hashedRefreshToken, rt);

    if (!credentialMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.global_role,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * Updates the password for a specified user and clears the flag for requiring a password change.
   *
   * @param {string} userId - The unique identifier of the user whose password is being changed.
   * @param {string} newPassword - The new password to be set for the user.
   * @return {Promise<void>} A promise that resolves when the password update is complete.
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    const hash = await argon2.hash(newPassword);

    await this.usersService.update(new Types.ObjectId(userId), {
      password: hash,
      mustChangePassword: false,
    });
  }

  /**
   * Registers a new user in the system.
   *
   * @param {RegisterDto} registerDto - The data transfer object containing user registration details.
   *                                     This includes the user's email, first name, and last name.
   * @return {Promise<void>} A promise that resolves when the user is successfully registered
   *                         and a welcome email is attempted to be sent. If the user already exists,
   *                         an error is thrown.
   */
  async registerUser(registerDto: RegisterDto): Promise<void> {
    const existingUser = await this.usersService.findOneByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const temporaryPassword = crypto.randomBytes(12).toString('hex');

    const newUserObject: CreateUserDto = {
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: temporaryPassword,
    };

    await this.usersService.create(newUserObject);

    try {
      await this.emailService.sendWelcomeEmail(
        registerDto.email,
        registerDto.firstName,
        temporaryPassword,
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  async loginWithGoogle(socialUser: SocialUser) {
    let user = await this.usersService.findOneByEmail(socialUser.email);

    const hashedAccessToken = await argon2.hash(socialUser.accessToken);

    if (!user) {
      const createDto = new CreateSocialUserDto();
      createDto.email = socialUser.email;
      createDto.firstName = socialUser.firstName;
      createDto.lastName = socialUser.lastName;
      createDto.google = {
        id: socialUser.googleId,
        accessToken: hashedAccessToken,
        avatar: socialUser.picture,
      };

      user = await this.usersService.createSocialUser(createDto);
    } else {
      user = await this.usersService.updateGoogleAuth(user._id.toString(), {
        id: socialUser.googleId,
        accessToken: hashedAccessToken,
        avatar: socialUser.picture,
      });
    }

    let tokens = {
      access_token: '',
      refresh_token: '',
    };

    if (user) {
      tokens = await this.getTokens(
        user._id,
        user.email,
        user.firstName,
        user.lastName,
        user.global_role,
      );

      await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
    }

    return {
      user,
      ...tokens,
    };
  }
}
