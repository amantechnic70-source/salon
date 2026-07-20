import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Invoice,
    InvoiceSchema,
} from '../schemas/invoice.schema';

import {
    Appointment,
    AppointmentSchema,
} from '../schemas/appointment.schema';

import {
    Salon,
    SalonSchema,
} from '../schemas/salon.schema';

import {
    Branch,
    BranchSchema,
} from '../schemas/branch.schema';

import {
    Customer,
    CustomerSchema,
} from '../schemas/customer.schema';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: Invoice.name,
                schema: InvoiceSchema,
            },

            {
                name: Appointment.name,
                schema: AppointmentSchema,
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
                name: Customer.name,
                schema: CustomerSchema,
            },

        ]),

    ],

    controllers: [
        InvoicesController,
    ],

    providers: [
        InvoicesService,
    ],

    exports: [
        InvoicesService,
    ],

})
export class InvoicesModule { }