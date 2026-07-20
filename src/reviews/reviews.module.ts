import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Review,
  ReviewSchema,
} from '../schemas/review.schema';

import {
  Appointment,
  AppointmentSchema,
} from '../schemas/appointment.schema';

import {
  Customer,
  CustomerSchema,
} from '../schemas/customer.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import {
  Staff,
  StaffSchema,
} from '../schemas/staff.schema';

import {
  Service,
  ServiceSchema,
} from '../schemas/service.schema';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({

  imports: [

    MongooseModule.forFeature([

      {
        name: Review.name,
        schema: ReviewSchema,
      },

      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },

      {
        name: Customer.name,
        schema: CustomerSchema,
      },

      {
        name: Salon.name,
        schema: SalonSchema,
      },

      {
        name: Staff.name,
        schema: StaffSchema,
      },

      {
        name: Service.name,
        schema: ServiceSchema,
      },

    ]),

  ],

  controllers: [
    ReviewsController,
  ],

  providers: [
    ReviewsService,
  ],

  exports: [
    ReviewsService,
  ],

})
export class ReviewsModule { }