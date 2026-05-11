import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { CourseDetailsService } from './course-details.service';
import { CourseDetailsDTO } from './dto/course-details.dto';
import { OrganizationRole, Role } from '@btg/shared-types';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('course-details')
export class CourseDetailsController {
  constructor(private readonly courseDetailsService: CourseDetailsService) {}

  @Get()
  findAll() {
    return this.courseDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseDetailsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Add course details' })
  @ApiResponse({
    status: 201,
    description: 'Course details added successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid course details' })
  @ApiBody({
    type: CourseDetailsDTO,
  })
  @Post()
  @Roles(OrganizationRole.TEACHER, Role.Admin, Role.SuperAdmin)
  addCourseDetails(
    @Body() courseDetails: CourseDetailsDTO,
    @Req() request: Request & { user: { id: string } },
  ) {
    return this.courseDetailsService.addCourseDetails(
      courseDetails,
      request.user.id,
    );
  }
  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCourseDetailDto: UpdateCourseDetailDto,
  // ) {
  //   return this.courseDetailsService.update(+id, updateCourseDetailDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.courseDetailsService.remove(+id);
  // }
}
