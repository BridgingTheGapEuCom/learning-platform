import { Module } from '@nestjs/common';
import { CourseDetailsController } from './course-details.controller';
import { CourseDetailsService } from './course-details.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CourseDetails,
  CourseDetailsSchema,
} from './schemas/course-details.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseDetails.name, schema: CourseDetailsSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [CourseDetailsController],
  providers: [CourseDetailsService],
})
export class CourseDetailsModule {}
