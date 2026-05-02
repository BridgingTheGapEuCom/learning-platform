import { Body, Controller, Post, Req } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { type RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { Role } from '@btg/shared-types';
import { CreateOrganizationDto } from './dto/organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Roles(Role.SuperAdmin)
  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.organizationsService.create(
      createOrganizationDto,
      req.user._id,
    );
  }
}
