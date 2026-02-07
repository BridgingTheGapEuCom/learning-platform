import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@btg/shared-types';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './schemas/user.schema';

@Controller('users') // This sets the route prefix to /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user in the system.
   *
   * This endpoint allows an administrator to register a new user with the provided details.
   * The new user's information, including sensitive data like password, is processed by the service.
   * Access to this endpoint is restricted to users with the 'Admin' role.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing the new user's details.
   *   - `email`: The user's unique email address (string, e.g., 'johnDoe@example.com').
   *   - `firstName`: The user's first name (string, e.g., 'John').
   *   - `lastName`: The user's last name (string, e.g., 'Doe').
   *   - `password`: The user's chosen password (string, e.g., 'demo1234').
   * @returns {Promise<User>} A promise that resolves to the newly created user object.
   *                          This object typically includes the user's ID and other non-sensitive details.
   *
   * @throws {BadRequestException} If the `createUserDto` fails validation (e.g., missing required fields,
   *                               invalid email format, password not meeting complexity requirements).
   *                               This results in a 400 Bad Request response.
   * @throws {ConflictException} If a user with the provided email address already exists in the database.
   *                             This results in a 409 Conflict response.
   * @throws {UnauthorizedException} If the request does not contain valid authentication credentials.
   *                                 (Corresponds to `ApiResponse({ status: 401, description: 'Unauthorized' })`).
   * @throws {ForbiddenException} If the authenticated user does not possess the `Admin` role required
   *                              to access this resource. This results in a 403 Forbidden response.
   * @throws {InternalServerErrorException} For any unexpected server-side errors during the user creation process.
   *                                        This would result in a 500 Internal Server Error response.
   */
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    type: CreateUserDto,
  })
  @Roles(Role.Admin)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  /**
   * Retrieves all user records.
   *
   * This endpoint fetches a list of all users currently registered in the system.
   *
   * @returns {Promise<User[]>} A promise that resolves to an array of User objects.
   *                            Returns an empty array if no users are found.
   * @throws {InternalServerErrorException} If an unexpected error occurs on the server during data retrieval.
   *                                        This would typically be caught by NestJS's global exception filters,
   *                                        resulting in a 500 Internal Server Error response.
   */
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a list of all users.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error occurred while retrieving users.',
  })
  @Roles(Role.Admin)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
