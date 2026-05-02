import { IsEmail, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Define the nested Google Data structure strictly
export class GoogleAuthDataDto {
    @IsString()
    @IsNotEmpty()
    id!: string; // Using ! because we know it will be assigned

    @IsString()
    accessToken?: string;

    @IsString()
    avatar?: string;
}

// 2. Define the Main DTO
export class CreateSocialUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @ValidateNested() // Validates the object inside
    @Type(() => GoogleAuthDataDto) // Tells class-transformer to convert it to an instance
    google!: GoogleAuthDataDto;
}