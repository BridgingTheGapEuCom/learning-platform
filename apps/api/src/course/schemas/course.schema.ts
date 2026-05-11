import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { CourseStatus, DifficultyLevel } from '@btg/shared-types';

/**
 * Represents the top-level metadata and configuration for a Course.
 */
@Schema({ timestamps: true })
export class Course extends Document {
  /**
   * The unique identifier for the course.
   */
  declare _id: Types.ObjectId;

  /**
   * The official title of the course.
   * @type {string}
   * @required
   */
  @Prop({ required: true })
  title: string;

  /**
   * A high-level overview of the course objectives and content.
   * @type {string}
   * @required
   */
  @Prop({ required: true })
  description: string;

  /**
   * The user responsible for the course creation.
   * @type {User | Types.ObjectId}
   * @required
   * @edge_case May return a raw ObjectId unless the 'creator' field is specifically populated during the query.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: User | Types.ObjectId;

  /**
   * The lifecycle status of the course (e.g., DRAFT, PUBLISHED).
   * @type {string}
   * @enum CourseStatus
   * @default CourseStatus.DRAFT
   * @required
   */
  @Prop({
    type: String,
    enum: [
      CourseStatus.DRAFT,
      CourseStatus.PUBLISHED,
      CourseStatus.UNDER_REVIEW,
      CourseStatus.RETIRED,
    ],
    default: CourseStatus.DRAFT,
    required: true,
  })
  status: string;

  /**
   * Searchable keywords or categories associated with the course.
   * @type {string[]}
   * @default []
   */
  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];

  /**
   * The target skill level for prospective students.
   * @type {string}
   * @enum DifficultyLevel
   * @required
   */
  @Prop({
    type: String,
    enum: [
      DifficultyLevel.BEGINNER,
      DifficultyLevel.ADVANCED,
      DifficultyLevel.INTERMEDIATE,
    ],
    required: true,
  })
  difficulty_level: string;

  /**
   * List of specific features included to improve accessibility (e.g., captions, specific fonts).
   * @type {string[]}
   * @example ["Closed Captions", "Dyslexia-Friendly Materials", "No Timed Quizzes"]
   */
  @Prop({
    type: [String],
  })
  accessibility_features: string[];
}

/**
 * Mongoose schema for the Course class.
 * @returns {import('mongoose').Schema} The generated Mongoose schema for the Course collection.
 */
export const CourseSchema = SchemaFactory.createForClass(Course);
