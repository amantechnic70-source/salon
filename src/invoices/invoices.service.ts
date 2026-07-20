import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetInvoicesDto } from './dto/get-invoices.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class InvoicesService {

    constructor(
        @InjectModel(Invoice.name)
        private readonly invoiceModel:
            Model<InvoiceDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,
    ) { }

    async createInvoice(
        userId: string,
        dto: CreateInvoiceDto,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const appointment =
            await this.appointmentModel.findOne({

                _id: dto.appointmentId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!appointment) {

            throw new BadRequestException(
                'Appointment not found.',
            );

        }

        const existingInvoice =
            await this.invoiceModel.findOne({

                appointmentId:
                    appointment._id,

                isDeleted: false,

            });

        if (existingInvoice) {

            throw new BadRequestException(
                'Invoice already generated.',
            );

        }

        const totalInvoices =
            await this.invoiceModel
                .countDocuments();


        const invoiceId =
            `INV${String(
                totalInvoices + 1,
            ).padStart(6, '0')}`;


        const invoiceNumber =
            `INVOICE-${String(
                totalInvoices + 1,
            ).padStart(6, '0')}`;


        const subtotal =
            appointment.totalAmount || 0;


        const discountAmount =
            appointment.discountAmount || 0;


        // GST LOGIC CAN BE UPDATED LATER

        const taxAmount = 0;


        const finalAmount =
            appointment.finalAmount || 0;


        const invoice =
            await this.invoiceModel.create({

                invoiceId,

                appointmentId:
                    appointment._id,

                salonId:
                    appointment.salonId,

                branchId:
                    appointment.branchId,

                customerId:
                    appointment.customerId,

                invoiceNumber,

                subtotal,

                discountAmount,

                taxAmount,

                finalAmount,

                remarks:
                    dto.remarks,

                paymentStatus:
                    appointment.paymentStatus,

                invoiceStatus:
                    'GENERATED',

                isActive:
                    true,

                isDeleted:
                    false,

            });


        return {

            success: true,

            message:
                'Invoice generated successfully.',

            data:
                invoice,

        };

    }

    async getAll(
        userId: string,
        query: GetInvoicesDto,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;


        const filter: any = {

            salonId:
                salon._id,

            isDeleted:
                false,

        };


        if (query.search) {

            filter.invoiceNumber = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }


        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };


        const totalInvoices =
            await this.invoiceModel
                .countDocuments(
                    filter,
                );


        const invoices =
            await this.invoiceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'appointmentId',
                )
                .populate(
                    'branchId',
                )
                .populate(
                    'customerId',
                );


        return {

            success: true,

            message:
                'Invoices fetched successfully.',

            data:
                invoices,

            pagination: {

                total:
                    totalInvoices,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalInvoices /
                        limit,
                    ),

            },

        };

    }

    async getById(
        userId: string,
        id: string,
    ) {
        const salon =
            await this.salonModel.findOne({
                ownerId: userId,
                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const invoice =
            await this.invoiceModel
                .findOne({
                    _id: id,
                    salonId: salon._id,
                    isDeleted: false,
                })
                .populate(
                    'appointmentId',
                )
                .populate(
                    'branchId',
                )
                .populate(
                    'customerId',
                );

        if (!invoice) {
            throw new BadRequestException(
                'Invoice not found.',
            );

        }

        return {
            success: true,
            message:
                'Invoice fetched successfully.',
            data:
                invoice,

        };

    }
    async downloadInvoice(
        userId: string,
        id: string,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const invoice =
            await this.invoiceModel
                .findOne({

                    _id: id,

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate(
                    'appointmentId',
                )

                .populate(
                    'branchId',
                )

                .populate(
                    'customerId',
                );


        if (!invoice) {

            throw new BadRequestException(
                'Invoice not found.',
            );

        }


        return {

            success: true,

            message:
                'Invoice downloaded successfully.',

            data:
                invoice,

        };

    }

    async getByCustomer(
        userId: string,
        customerId: string,
    ) {

        const salon =
            await this.salonModel.findOne({
                ownerId: userId,
                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }


        const invoices =
            await this.invoiceModel
                .find({

                    salonId:
                        salon._id,

                    customerId,

                    isDeleted:
                        false,

                })

                .populate(
                    'appointmentId',
                )

                .populate(
                    'branchId',
                )

                .populate(
                    'customerId',
                )


                .sort({

                    createdAt: -1,

                });


        return {

            success: true,

            message:
                'Customer invoices fetched successfully.',

            data:
                invoices,

        };

    }

    async getByAppointment(
        userId: string,
        appointmentId: string,
    ) {

        const salon =
            await this.salonModel.findOne({

                ownerId: userId,

                isDeleted: false,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        const invoice =
            await this.invoiceModel
                .findOne({

                    appointmentId,

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate(
                    'appointmentId',
                )

                .populate(
                    'branchId',
                )

                .populate(
                    'customerId',
                );

        if (!invoice) {

            throw new BadRequestException(
                'Invoice not found.',
            );

        }

        return {

            success: true,

            message:
                'Invoice fetched successfully.',

            data:
                invoice,

        };

    }

    async searchInvoices(
        query: GetInvoicesDto,
    ) {

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {

            isDeleted: false,

        };

        if (query.search) {

            filter.invoiceNumber = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalInvoices =
            await this.invoiceModel
                .countDocuments(
                    filter,
                );

        const invoices =
            await this.invoiceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'appointmentId',
                )
                .populate(
                    'salonId',
                )
                .populate(
                    'branchId',
                )
                .populate(
                    'customerId',
                );

        return {

            success: true,

            message:
                'Invoices fetched successfully.',

            data:
                invoices,

            pagination: {

                total:
                    totalInvoices,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalInvoices /
                        limit,
                    ),

            },

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetInvoicesDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {};

        if (query.search) {

            filter.invoiceNumber = {

                $regex:
                    query.search,

                $options:
                    'i',

            };

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalInvoices =
            await this.invoiceModel
                .countDocuments(
                    filter,
                );

        const invoices =
            await this.invoiceModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(
                    'appointmentId',
                )
                .populate(
                    'salonId',
                )
                .populate(
                    'branchId',
                )
                .populate(
                    'customerId',
                );

        return {

            success: true,

            message:
                'Invoices fetched successfully.',

            data:
                invoices,

            pagination: {

                total:
                    totalInvoices,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalInvoices /
                        limit,
                    ),

            },

        };

    }

    async updateInvoiceStatus(
        user: any,
        id: string,
        dto: UpdateInvoiceStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const invoice =
            await this.invoiceModel.findById(
                id,
            );

        if (!invoice) {

            throw new BadRequestException(
                'Invoice not found.',
            );

        }

        Object.assign(
            invoice,
            dto,
        );

        await invoice.save();

        return {

            success: true,

            message:
                'Invoice status updated successfully.',

            data:
                invoice,

        };

    }

    async deleteInvoiceByAdmin(
        user: any,
        id: string,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const invoice =
            await this.invoiceModel.findById(
                id,
            );

        if (!invoice) {

            throw new BadRequestException(
                'Invoice not found.',
            );

        }

        invoice.isDeleted = true;
        invoice.isActive = false;
        invoice.invoiceStatus =
            'DELETED';

        await invoice.save();

        return {

            success: true,

            message:
                'Invoice deleted successfully.',

        };

    }
}