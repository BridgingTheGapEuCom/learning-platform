import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CourseDetailsDTO } from './dto/course-details.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseDetails } from './schemas/course-details.schema';
import { Course } from 'src/course/schemas/course.schema';

@Injectable()
export class CourseDetailsService {
  constructor(
    @InjectModel(CourseDetails.name)
    private courseDetailsModel: Model<CourseDetails>,
    @InjectModel(Course.name)
    private courseModel: Model<Course>,
  ) {}

  create(createCourseDetailDto: CourseDetailsDTO): Promise<CourseDetails> {
    return this.courseDetailsModel.create(createCourseDetailDto);
  }

  findAll(): Promise<CourseDetails[]> {
    return this.courseDetailsModel.find().exec();
  }

  findOne(id: number): Promise<CourseDetails | null> {
    return this.courseDetailsModel.findById(id).exec();
  }

  /**
   * Adds specific course details to the database for a given user.
   *
   * @param {CourseDetailsDTO} course - The data transfer object containing course details.
   * @param {string} userId - The unique identifier of the user/creator.
   * @returns {Promise<CourseDetails | null>} A promise that resolves to the newly created course details, or null if a course with the same ID and creator already exists.
   * @throws {Error} If the database query or save operation fails.
   */
  async addCourseDetails(
    course: CourseDetailsDTO,
    userId: string,
  ): Promise<CourseDetails | null> {
    const doesItExist = await this.courseModel
      .find({
        id: new Types.ObjectId(course.course_id),
        creator: userId,
      })
      .exec();

    if (!doesItExist) {
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
    }

    if (course.version_number === undefined) {
      const currentVersions = await this.courseDetailsModel.find({
        course_id: new Types.ObjectId(course.course_id),
      });

      if (currentVersions.length > 0) {
        course.version_number = currentVersions.length + 1;
      } else {
        course.version_number = 1;
      }
    } else {
      const versionToChange = await this.courseDetailsModel.findOne({
        course_id: course.course_id,
        version_number: course.version_number,
      });

      if (versionToChange) {
        throw new HttpException('Version already exists', HttpStatus.CONFLICT);
      }
    }

    return await this.courseDetailsModel.create(course);
  }

  update(
    id: number,
    updateCourseDetailDto: CourseDetailsDTO,
  ): Promise<CourseDetails | null> {
    return this.courseDetailsModel
      .findByIdAndUpdate(id, updateCourseDetailDto, { new: true })
      .exec();
  }
}
