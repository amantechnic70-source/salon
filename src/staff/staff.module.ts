
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Staff,
  StaffSchema,
} from '../schemas/staff.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import {
  Branch,
  BranchSchema,
} from '../schemas/branch.schema';

import {
  Subscription,
  SubscriptionSchema,
} from '../schemas/subscription.schema';

import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../schemas/subscription-plan.schema';

import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Staff.name,
        schema: StaffSchema,
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
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
    ]),
  ],
  controllers: [
    StaffController,
  ],
  providers: [
    StaffService,
  ],
  exports: [
    StaffService,
  ],
})
export class StaffModule { }
