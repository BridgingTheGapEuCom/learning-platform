import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/organization.dto';
import { Organization } from './schemas/organization.schema';
import { UsersService } from '../users/users.service';
import { OrganizationRole } from '@btg/shared-types';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<Organization>,
    private usersService: UsersService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    ownerId: Types.ObjectId,
  ) {
    try {
      const createdOrg = new this.orgModel({
        ...createOrganizationDto,
        owner: ownerId,
        members: [
          {
            user: ownerId,
            role: OrganizationRole.ADMIN,
            joinedAt: new Date(),
          },
        ],
      });

      const savedOrg = await createdOrg.save();

      await this.usersService.addOrganization(ownerId, savedOrg._id);

      return savedOrg;
    } catch (error) {
      if (error && (error as { code: number }).code === 11000) {
        throw new ConflictException(
          'Organization with this name already exists',
        );
      }
      throw error;
    }
  }
}
