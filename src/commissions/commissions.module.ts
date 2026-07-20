import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Commission,
    CommissionSchema,
} from '../schemas/commission.schema';

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

import {
    Appointment,
    AppointmentSchema,
} from '../schemas/appointment.schema';

import {
    Service,
    ServiceSchema,
} from '../schemas/service.schema';

import {
    Invoice,
    InvoiceSchema,
} from '../schemas/invoice.schema';

import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';

@Module({

    imports: [

        MongooseModule.forFeature([

            {
                name: Commission.name,
                schema: CommissionSchema,
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
                name: Appointment.name,
                schema: AppointmentSchema,
            },

            {
                name: Service.name,
                schema: ServiceSchema,
            },

            {
                name: Invoice.name,
                schema: InvoiceSchema,
            },

        ]),

    ],

    controllers: [
        CommissionsController,
    ],

    providers: [
        CommissionsService,
    ],

    exports: [
        CommissionsService,
    ],

})
export class CommissionsModule { }