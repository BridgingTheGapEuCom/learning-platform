import { SetMetadata } from '@nestjs/common';
import { Role } from '@btg/shared-types';
import { OrganizationRole } from '@btg/shared-types';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: (Role | OrganizationRole)[]) =>
  SetMetadata(ROLES_KEY, roles);
