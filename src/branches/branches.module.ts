import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import {
  Branch,
  BranchSchema,
} from '../schemas/branch.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import {
  Subscription,
  SubscriptionSchema,
} from '../schemas/subscription.schema';

import {
  SubscriptionPlan,
  SubscriptionPlanSchema,
} from '../schemas/subscription-plan.schema';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { User, UserSchema } from 'src/schemas/user.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Branch.name,
        schema: BranchSchema,
      },
      {
        name: Salon.name,
        schema: SalonSchema,
      },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: SubscriptionPlan.name,
        schema: SubscriptionPlanSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [
    BranchesController,
  ],
  providers: [
    BranchesService,
  ],
  exports: [
    BranchesService,
  ],
})
export class BranchModule { }