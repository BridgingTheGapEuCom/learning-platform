import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsMongoId,
  IsNumber,
} from 'class-validator';

/**
 * Represents a single educational lesson within a course module.
 *
 * @class LessonDTO
 */
export class LessonDTO {
  /**
   * The descriptive title of the lesson.
   *
   * @param {string} title - The lesson's name.
   * @returns {string} The lesson title value.
   * @edge_case Validation fails if the string is empty, null, or undefined.
   */
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Example Title',
    description: 'Lesson title',
    required: true,
  })
  title: string;

  /**
   * The classification type of the lesson (e.g., 'video', 'quiz', 'text').
   *
   * @param {string} type - The format category of the lesson.
   * @returns {string} The lesson type value.
   * @edge_case Validation fails if the string is empty, null, or undefined.
   */
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'video',
    description: 'Lesson type (e.g., video, quiz, text)',
    required: true,
  })
  type: string;

  /**
   * Optional structured data containing the specific material for the lesson.
   *
   * @param {Record<string, any>} [content] - The dynamic lesson payload.
   * @returns {Record<string, any> | undefined} The content object or undefined.
   * @edge_case Field is optional and can be safely omitted or left undefined.
   */
  @IsOptional()
  @ApiProperty({
    example: { video_url: 'https://example.com/video.mp4', duration: 300 },
    description: 'Lesson content as a dynamic object',
    required: false,
  })
  content?: Record<string, any>;
}

/**
 * Represents a logical grouping of lessons within a course curriculum.
 *
 * @class ModuleDTO
 */
export class ModuleDTO {
  /**
   * The heading or name of the module.
   *
   * @param {string} title - The module's title.
   * @returns {string} The module title value.
   * @edge_case Validation fails if the string is empty, null, or undefined.
   */
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Introduction to TypeScript',
    description: 'Module title',
    required: true,
  })
  title: string;

  /**
   * The numerical position of the module within the course.
   *
   * @param {number} order - The sequence index.
   * @returns {number} The order value.
   * @edge_case Validation fails if the value is not a number or is empty.
   */
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'Module order/position in the course',
    required: true,
  })
  order: number;

  /**
   * The list of lessons associated with this specific module.
   *
   * @param {LessonDTO[]} lessons - The array of lesson objects.
   * @returns {LessonDTO[]} The lessons array.
   * @edge_case Validation fails if the value is not an array.
   */
  @IsArray()
  @ApiProperty({
    type: [LessonDTO],
    description: 'List of lessons in the module',
    required: true,
  })
  lessons: LessonDTO[];
}

/**
 * Contains comprehensive metadata and structure for a course instance.
 *
 * @class CourseDetailsDTO
 */
export class CourseDetailsDTO {
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
  @IsOptional()
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
