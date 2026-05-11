import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Role, OrganizationRole } from '@btg/shared-types';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(OrganizationRole.TEACHER, Role.Admin, Role.SuperAdmin)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.courseService.create(createCourseDto, request.user.id);
  }

  @Get()
  @Roles(OrganizationRole.TEACHER, Role.Admin, Role.SuperAdmin)
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @Roles(OrganizationRole.TEACHER, Role.Admin, Role.SuperAdmin)
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @Roles(OrganizationRole.TEACHER, Role.Admin, Role.SuperAdmin)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(OrganizationRole.TEACHER, Role.Admin, Role.SuperAdmin)
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
