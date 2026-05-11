import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { CourseStatus, DifficultyLevel } from '@btg/shared-types';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsEnum(DifficultyLevel)
  @IsNotEmpty()
  difficulty_level!: DifficultyLevel;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  accessibility_features?: string[];
}

export class internalCreateCourseDto extends CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  creator!: string;
}
