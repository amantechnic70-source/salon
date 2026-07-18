import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  MembershipPlan,
  MembershipPlanSchema,
} from '../schemas/membership-plan.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import {
  Customer,
  CustomerSchema,
} from '../schemas/customer.schema';

import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { Membership, MembershipSchema } from 'src/schemas/membership.schema';

@Module({

  imports: [

    MongooseModule.forFeature([

      {
        name: Membership.name,
        schema: MembershipSchema,
      },

      {
        name: MembershipPlan.name,
        schema: MembershipPlanSchema,
      },

      {
        name: Salon.name,
        schema: SalonSchema,
      },

      {
        name: Customer.name,
        schema: CustomerSchema,
      },

    ]),

  ],

  controllers: [
    MembershipsController,
  ],

  providers: [
    MembershipsService,
  ],

  exports: [
    MembershipsService,
  ],

})
export class MembershipsModule { }