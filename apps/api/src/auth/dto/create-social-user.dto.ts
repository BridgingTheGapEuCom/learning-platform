import { IsEmail, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Define the nested Google Data structure strictly
export class GoogleAuthDataDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  accessToken?: string;

  @IsString()
  avatar?: string;
}

export class CreateSocialUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ValidateNested()
  @Type(() => GoogleAuthDataDto)
  google!: GoogleAuthDataDto;
}
