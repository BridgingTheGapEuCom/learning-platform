import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { ModuleDTO } from './course-details.dto';

export class UpdateCourseDetailsDTO {
  /**
   * The unique database identifier for the parent course.
   *
   * @param {string} course_id - The MongoDB object ID.
   * @returns {string} The course identifier.
   * @edge_case Validation fails if the string is not a valid MongoId.
   */
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    example: '5f8d0d55b54764421b7156a8',
    description: 'MongoDB course ID',
    required: true,
  })
  course_id: string;

  /**
   * The specific revision number of the course content.
   *
   * @param {number} version_number - The version increment.
   * @returns {number} The version number value.
   * @edge_case Validation fails if the value is not a number or is empty.
   */
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Course version number',
    required: true,
  })
  version_number?: number;

  /**
   * Optional URL for the course's visual representation.
   *
   * @param {string} [thumbnail_url] - The image location string.
   * @returns {string | undefined} The thumbnail URL or undefined.
   * @edge_case Field is optional; validation fails if a provided value is not a string.
   */
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'https://example.com/course-thumbnail.jpg',
    description: 'Course thumbnail URL',
    required: false,
  })
  thumbnail_url?: string;

  /**
   * Optional estimate of how long the course takes to finish.
   *
   * @param {number} [estimated_duration_minutes] - Duration in minutes.
   * @returns {number | undefined} The duration value or undefined.
   * @edge_case Field is optional; validation fails if a provided value is not a number.
   */
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 120,
    description: 'Estimated course duration in minutes',
    required: false,
  })
  estimated_duration_minutes?: number;

  /**
   * The complete list of modules that make up the course.
   *
   * @param {ModuleDTO[]} syllabus - The hierarchical module array.
   * @returns {ModuleDTO[]} The syllabus array.
   * @edge_case Validation fails if the value is not an array.
   */
  @IsArray()
  @ApiProperty({
    type: [ModuleDTO],
    description: 'List of modules in the course',
    required: true,
  })
  syllabus: ModuleDTO[];
}
