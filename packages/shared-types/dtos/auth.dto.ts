import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data transfer object (DTO) for user login information.
 * This class is used to validate and transfer login details.
 *
 * Properties:
 * - `email`: Represents the email of the user.
 *   - Must be a valid email format.
 * - `password`: Represents the password of the user.
 *   - Must be a string with a minimum length requirement.
 */
export class LoginDto {
  @ApiProperty({ example: "admin@test.com", description: "User email" })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "password123",
    description: "User password",
    minLength: 8,
  })
  @IsString()
  password!: string;
}

/**
 * Data Transfer Object (DTO) for changing a user's password.
 * Used to validate and encapsulate the new password information.
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: "password123",
    description: "User password",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  newPassword!: string;
}

/**
 * Data Transfer Object for user registration.
 *
 * This class is used to structure and validate the data provided during user registration.
 * It includes fields for the user's email, first name, and last name, along with
 * validation rules to ensure the correctness of input data.
 */
export class RegisterDto {
  @ApiProperty({
    example: "admin@test.com",
    description: "User email",
    required: true,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "John", description: "First name", required: true })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: "Doe", description: "Last name", required: true })
  @IsString()
  lastName!: string;
}
