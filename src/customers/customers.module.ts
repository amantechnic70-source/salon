import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Customer,
  CustomerSchema,
} from '../schemas/customer.schema';

import {
  Salon,
  SalonSchema,
} from '../schemas/salon.schema';

import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Customer.name,
        schema: CustomerSchema,
      },
      {
        name: Salon.name,
        schema: SalonSchema,
      },
    ]),
  ],
  controllers: [
    CustomersController,
  ],
  providers: [
    CustomersService,
  ],
  exports: [
    CustomersService,
  ],
})
export class CustomersModule { }