import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Attendance,
  AttendanceSchema,
} from '../schemas/attendance.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import {
  Branch,
  BranchSchema,
} from '../schemas/branch.schema';

import {
  Staff,
  StaffSchema,
} from '../schemas/staff.schema';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Subscription, SubscriptionSchema } from 'src/schemas/subscription.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({

  imports: [

    MongooseModule.forFeature([

      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },

      {
        name: Salon.name,
        schema: SalonSchema,
      },

      {
        name: Branch.name,
        schema: BranchSchema,
      },

      {
        name: Staff.name,
        schema: StaffSchema,
      },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },

    ]),

  ],

  controllers: [
    AttendanceController,
  ],

  providers: [
    AttendanceService,
  ],

  exports: [
    AttendanceService,
  ],

})
export class AttendanceModule { }