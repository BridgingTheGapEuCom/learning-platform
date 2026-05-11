import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  /**
   * Creates a new course in the database.
   *
   * @param {CreateCourseDto} createCourseDto - The data transfer object containing course details.
   * @returns {Promise<Course>} A promise that resolves to the newly created course document.
   * @throws {Error} If the course creation fails due to validation or database errors.
   */
  async create(
    createCourseDto: CreateCourseDto,
    userId: string,
  ): Promise<Course> {
    const createCourseDtoWithCreator = { ...createCourseDto, creator: userId };
    const createdCourse = new this.courseModel(createCourseDtoWithCreator);
    return createdCourse.save();
  }

  /**
   * Retrieves all courses from the database.
   *
   * @returns {Promise<Course[]>} A promise that resolves to an array of all course documents.
   * @throws {Error} If the database query fails.
   */
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  /**
   * Retrieves a single course by its unique identifier.
   *
   * @param {string} id - The unique identifier of the course to retrieve.
   * @returns {Promise<Course | null>} A promise that resolves to the course document if found, or null if not found.
   * @throws {Error} If the database query fails or the provided ID is invalid.
   */
  async findOne(id: string): Promise<Course | null> {
    return this.courseModel.findById(id).exec();
  }

  /**
   * Updates an existing course with new data.
   *
   * @param {string} id - The unique identifier of the course to update.
   * @param {UpdateCourseDto} updateCourseDto - The data transfer object containing updated course details.
   * @returns {Promise<Course | null>} A promise that resolves to the updated course document if found and updated, or null if not found.
   * @throws {Error} If the update operation fails due to validation errors or database issues.
   */
  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course | null> {
    return this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
  }

  /**
   * Deletes a course by its unique identifier.
   *
   * @param {string} id - The unique identifier of the course to delete.
   * @returns {Promise<Course | null>} A promise that resolves to the deleted course document if found and deleted, or null if not found.
   * @throws {Error} If the deletion operation fails due to database issues.
   */
  async remove(id: string): Promise<Course | null> {
    return this.courseModel.findByIdAndDelete(id).exec();
  }
}
