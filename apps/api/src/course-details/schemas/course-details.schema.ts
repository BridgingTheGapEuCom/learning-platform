import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

/**
 * Represents an individual unit of instruction within a module.
 */
@Schema()
export class Lesson {
  /**
   * The display name or heading of the lesson.
   * @type {string}
   * @required
   */
  @Prop({ required: true })
  title: string;

  /**
   * The format of the lesson content, determining how it should be rendered.
   * @type {string}
   * @enum ['video', 'text', 'quiz']
   * @required
   * @edge_case Validation will fail if a value outside the enum is provided.
   */
  @Prop({ required: true, enum: ['video', 'text', 'quiz'] })
  type: string;

  /**
   * The actual content of the lesson. The internal structure varies based on the `type`.
   * @type {Record<string, any>}
   * @required
   * @edge_case Since this is a Mixed type, Mongoose does not automatically track changes to
   * nested properties. Use `Document.markModified()` if updating internal keys manually.
   */
  @Prop({ type: SchemaTypes.Mixed, required: true })
  content: Record<string, any>;
}

/**
 * Mongoose schema for the Lesson class.
 * @returns {import('mongoose').Schema} The generated Mongoose schema for Lesson subdocuments.
 */
export const LessonSchema = SchemaFactory.createForClass(Lesson);

/**
 * Represents a logical grouping of lessons within a course structure.
 */
@Schema()
export class Module {
  /**
   * The title of the module.
   * @type {string}
   * @required
   */
  @Prop({ required: true })
  title: string;

  /**
   * The numerical order used to sort modules within the course syllabus.
   * @type {number}
   * @required
   */
  @Prop({ required: true })
  order: number;

  /**
   * An array of nested Lesson subdocuments.
   * @type {Lesson[]}
   * @default []
   * @edge_case New modules initialize with an empty array if no lessons are provided.
   */
  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];
}

/**
 * Mongoose schema for the Module class.
 * @returns {import('mongoose').Schema} The generated Mongoose schema for Module subdocuments.
 */
export const ModuleSchema = SchemaFactory.createForClass(Module);

/**
 * Stores the structural content and version-specific metadata for a course.
 */
@Schema({ timestamps: true })
export class CourseDetails extends Document {
  /**
   * The unique identifier for this version's details.
   */
  declare _id: Types.ObjectId;

  /**
   * Reference to the parent Course document.
   * @type {Types.ObjectId}
   * @required
   * @edge_case Must be a valid ObjectId corresponding to an existing document in the 'Course' collection.
   */
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  /**
   * The version number of the course content.
   * @type {number}
   * @required
   */
  @Prop({ type: Number, required: true })
  version_number: number;

  /**
   * The URL for the course's visual preview.
   * @type {string}
   */
  @Prop({
    type: String,
  })
  thumbnail_url: string;

  /**
   * Total estimated time in minutes required to complete the syllabus content.
   * @type {number}
   */
  @Prop({
    type: Number,
  })
  estimated_duration_minutes: number;

  /**
   * The hierarchical collection of modules and lessons making up the course content.
   * @type {Module[]}
   * @default []
   */
  @Prop({
    type: [ModuleSchema],
    default: [],
  })
  syllabus: Module[];
}

export const CourseDetailsSchema = SchemaFactory.createForClass(CourseDetails);
