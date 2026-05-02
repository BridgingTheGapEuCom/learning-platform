import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type Request, type Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../users/schemas/user.schema';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SkipPasswordChange } from './decorators/skip-password-change.decorator';
import { ChangePasswordDto, RegisterDto } from './dto/auth.dto';
import { SocialUser } from '@btg/shared-types/dist/interfaces/social-user.interface';
import { type RequestWithUser } from './interfaces/request-with-user.interface';
import { LoginDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Handles user login, validates credentials, generates tokens, and sets a refresh token cookie.
   *
   * @param loginDto - The login data transfer object containing email and password.
   * @param res - The Express response object for setting cookies.
   * @returns An object containing the access token and the authenticated user.
   * @throws UnauthorizedException if credentials are invalid.
   */
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expirationTime: string | undefined = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    );
    let maxAge: number;

    if (isNaN(Number(expirationTime))) {
      maxAge = ms(expirationTime as StringValue);
    } else {
      maxAge = Number(expirationTime) * 1000;
    }

    const tokens = await this.authService.login(user as User);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return {
      access_token: tokens.access_token,
      user: user,
    };
  }

  /**
   * Refreshes the access token using the provided refresh token from the request's cookies.
   * It validates the refresh token, decodes its payload, and generates new tokens.
   * The new refresh token is set in the cookies for subsequent requests.
   *
   * @param {Request} req - The incoming HTTP request containing the cookies with the refresh token.
   * @param {Response} res - The outgoing HTTP response where the new refresh token is set in the cookies.
   * @return {Promise<{ access_token: string }>} The newly generated access token.
   * @throws {UnauthorizedException} Throws if the refresh token is missing, invalid, or improperly formatted.
   */
  @Public()
  @SkipPasswordChange()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const refreshToken: string = req.cookies['refresh_token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException('No Refresh Token found in cookies');
    }

    const payload: JwtPayload = this.jwtService.decode(refreshToken);

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid Refresh Token format');
    }

    const tokens = await this.authService.refreshTokens(
      payload.sub,
      refreshToken,
    );

    const expirationTime: string | undefined = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    );
    let maxAge: number;

    if (isNaN(Number(expirationTime))) {
      maxAge = ms(expirationTime as StringValue);
    } else {
      maxAge = Number(expirationTime) * 1000;
    }

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return { access_token: tokens.access_token };
  }

  /**
   * Handles the request to change a user's password.
   *
   * @param {ChangePasswordDto} dto - The data transfer object containing the new password.
   * @param {RequestWithUser} req - The request object that includes authenticated user details.
   * @return {Promise<Object>} A promise that resolves to an object containing a success message.
   */
  @Post('change-password')
  @SkipPasswordChange()
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: RequestWithUser,
  ): Promise<object> {
    await this.authService.changePassword(
      req.user._id.toString(),
      dto.newPassword,
    );
    return { message: 'Password updated successfully' };
  }

  /**
   * Logs out the currently authenticated user by clearing the refresh token cookie.
   *
   * @param {RequestWithUser} req - The request object containing the authenticated user's data.
   * @param {Response} res - The response object used to clear the refresh token cookie.
   * @return {Promise<{ message: string }>} Returns a confirmation message indicating successful logout.
   */
  @Post('logout')
  @SkipPasswordChange()
  @Public()
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(req.user?.id);

    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Retrieves the profile information of the currently authenticated user.
   *
   * @param {RequestWithUser} req - The request object containing user information.
   * @return {User} The user information associated with the request.
   */
  @Get('profile')
  getProfile(@Req() req: RequestWithUser): User {
    return req.user;
  }

  /**
   * Handles the registration of a new user.
   *
   * @param {RegisterDto} body - The data transfer object containing user registration details.
   * @return {Promise<void>} A promise that resolves when the user registration process is completed successfully.
   */
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 200, description: 'User registered' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  @ApiBody({
    type: RegisterDto,
  })
  @Public()
  @Post('register')
  async registerUser(@Body() body: RegisterDto): Promise<void> {
    await this.authService.registerUser(body);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects automatically to Google endpoint
  }

  @Public()
  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const socialUser = req.user as SocialUser;

    const { refresh_token } =
      await this.authService.loginWithGoogle(socialUser);

    const expirationTime: string | undefined = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    );
    let maxAge: number;

    if (isNaN(Number(expirationTime))) {
      maxAge = ms(expirationTime as StringValue);
    } else {
      maxAge = Number(expirationTime) * 1000;
    }

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    res.redirect(`http://localhost:9000/refreshToken`);
  }
}
