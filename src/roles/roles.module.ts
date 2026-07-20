import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import {
  Staff,
  StaffSchema,
} from '../schemas/staff.schema';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role, RoleSchema } from 'src/schemas/role.schema';
import { Permission, PermissionSchema } from 'src/schemas/permission.schema';

@Module({

  imports: [

    MongooseModule.forFeature([

      {
        name: Role.name,
        schema: RoleSchema,
      },

      {
        name: Permission.name,
        schema: PermissionSchema,
      },

      {
        name: Salon.name,
        schema: SalonSchema,
      },

      {
        name: Staff.name,
        schema: StaffSchema,
      },

    ]),

  ],

  controllers: [
    RolesController,
  ],

  providers: [
    RolesService,
  ],

  exports: [
    RolesService,
  ],

})
export class RolesModule { }