import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Role } from '@btg/shared-types';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
