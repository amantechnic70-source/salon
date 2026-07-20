import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateCommissionDto } from './dto/create-commission.dto';
import { GetCommissionsDto } from './dto/get-commissions.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Commission, CommissionDocument } from 'src/schemas/commission.schema';
import { Model } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { Service, ServiceDocument } from 'src/schemas/service.schema';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class CommissionsService {

    constructor(
        @InjectModel(Commission.name)
        private readonly commissionModel:
            Model<CommissionDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Invoice.name)
        private readonly invoiceModel:
            Model<InvoiceDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateCommissionDto,
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

        const staff =
            await this.staffModel.findOne({
                _id: appointment.staffId,
                salonId: salon._id,
                isDeleted: false,

            });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const service =
            await this.serviceModel.findOne({

                _id: dto.serviceId,

                isDeleted: false,

            });

        if (!service) {

            throw new BadRequestException(
                'Service not found.',
            );

        }

        const invoice =
            await this.invoiceModel.findOne({

                _id: dto.invoiceId,

                salonId: salon._id,

                isDeleted: false,

            });

        if (!invoice) {

            throw new BadRequestException(
                'Invoice not found.',
            );

        }

        const existingCommission =
            await this.commissionModel.findOne({

                appointmentId:
                    appointment._id,

                serviceId:
                    service._id,

                isDeleted:
                    false,

            });

        if (existingCommission) {

            throw new BadRequestException(
                'Commission already exists.',
            );

        }

        const totalCommissions =
            await this.commissionModel
                .countDocuments();

        const commissionId =
            `COM${String(
                totalCommissions + 1,
            ).padStart(6, '0')}`;

        const commissionAmount =
            Number(

                (
                    (
                        invoice.finalAmount *
                        dto.commissionPercentage
                    ) / 100
                ).toFixed(2),

            );

        const commission =
            await this.commissionModel.create({

                commissionId,

                salonId:
                    salon._id,

                branchId:
                    staff.branchId,

                staffId:
                    staff._id,

                appointmentId:
                    appointment._id,

                serviceId:
                    service._id,

                invoiceId:
                    invoice._id,

                commissionPercentage:
                    dto.commissionPercentage,

                serviceAmount:
                    invoice.finalAmount,

                commissionAmount,

                commissionStatus:
                    'PENDING',

                commissionDate:
                    new Date(),

                remarks:
                    dto.remarks,

                isPaid:
                    false,

                isActive:
                    true,

                isDeleted:
                    false,

            });

        return {

            success: true,

            message:
                'Commission created successfully.',

            data:
                commission,

        };

    }

    async getAll(
        userId: string,
        query: GetCommissionsDto,
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

            filter.$or = [

                {

                    commissionId: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    commissionStatus: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

            ];

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalCommissions =
            await this.commissionModel
                .countDocuments(
                    filter,
                );

        const commissions =
            await this.commissionModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('staffId')
                .populate('branchId')
                .populate('appointmentId')
                .populate('serviceId')
                .populate('invoiceId');

        return {

            success: true,

            message:
                'Commissions fetched successfully.',

            data:
                commissions,

            pagination: {

                total:
                    totalCommissions,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalCommissions /
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

        const commission =
            await this.commissionModel
                .findOne({
                    _id: id,
                    salonId: salon._id,
                    isDeleted: false,

                })
                .populate('staffId')
                .populate('branchId')
                .populate('appointmentId')
                .populate('serviceId')
                .populate('invoiceId');

        if (!commission) {

            throw new BadRequestException(
                'Commission not found.',
            );

        }

        return {
            success: true,
            message:
                'Commission fetched successfully.',
            data:
                commission,

        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateCommissionDto,
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

        const commission =
            await this.commissionModel.findOne({
                _id: id,
                salonId: salon._id,
                isDeleted: false,

            });

        if (!commission) {
            throw new BadRequestException(
                'Commission not found.',
            );

        }

        if (
            dto.commissionPercentage !==
            undefined
        ) {

            commission.commissionPercentage =
                dto.commissionPercentage;
            commission.commissionAmount =
                Number(
                    (
                        (
                            commission.serviceAmount *
                            dto.commissionPercentage
                        ) / 100
                    ).toFixed(2),

                );

        }

        if (dto.remarks) {
            commission.remarks =
                dto.remarks;

        }

        await commission.save();
        return {
            success: true,
            message:
                'Commission updated successfully.',
            data:
                commission,

        };

    }

    async deleteCommission(
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

        const commission =
            await this.commissionModel.findOne({
                _id: id,
                salonId: salon._id,
                isDeleted: false,

            });

        if (!commission) {
            throw new BadRequestException(
                'Commission not found.',
            );

        }

        commission.isDeleted = true;
        commission.isActive = false;
        await commission.save();

        return {
            success: true,
            message:
                'Commission deleted successfully.',

        };

    }

    async getStaffCommission(
        userId: string,
        staffId: string,
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

        const staff =
            await this.staffModel.findOne({
                _id: staffId,
                salonId: salon._id,
                isDeleted: false,

            });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const commissions =
            await this.commissionModel

                .find({

                    staffId: staff._id,

                    isDeleted: false,

                })

                .sort({

                    createdAt: -1,

                })

                .populate('staffId')
                .populate('branchId')
                .populate('appointmentId')
                .populate('serviceId')
                .populate('invoiceId');

        return {

            success: true,

            message:
                'Staff commissions fetched successfully.',

            data: commissions,

        };

    }

    async getMyCommission(
        userId: string,
    ) {

        const staff =
            await this.staffModel.findOne({
                _id: userId,
                isDeleted: false,
                isActive: true,

            });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const commissions =
            await this.commissionModel
                .find({
                    staffId: staff._id,
                    isDeleted: false,

                })
                .sort({
                    createdAt: -1,

                })
                .populate('appointmentId')
                .populate('serviceId')
                .populate('invoiceId');

        return {
            success: true,
            message:
                'My commissions fetched successfully.',
            data: commissions,

        };

    }

    async getMonthlyCommission(
        userId: string,
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

        const startOfMonth =
            new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
            );

        const endOfMonth =
            new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0,
                23,
                59,
                59,
                999,
            );

        const commissions =
            await this.commissionModel.find({
                salonId: salon._id,
                commissionDate: {
                    $gte:
                        startOfMonth,

                    $lte:
                        endOfMonth,

                },

                isDeleted: false,

            });

        const totalCommissionAmount =
            commissions.reduce(
                (sum, item) =>
                    sum +
                    item.commissionAmount,

                0,

            );

        const totalPaidCommission =
            commissions
                .filter(
                    item =>
                        item.isPaid,
                )

                .reduce(

                    (sum, item) =>
                        sum +
                        item.commissionAmount,

                    0,

                );

        const totalPendingCommission =
            commissions
                .filter(
                    item =>
                        !item.isPaid,
                )

                .reduce(

                    (sum, item) =>
                        sum +
                        item.commissionAmount,

                    0,

                );

        return {
            success: true,
            message:
                'Monthly commission report fetched successfully.',
            data: {
                totalCommissions:
                    commissions.length,
                totalCommissionAmount,
                totalPaidCommission,
                totalPendingCommission,
                commissions,

            },

        };

    }

    async getTopPerformingStaff() {

        const topStaff =
            await this.commissionModel.aggregate([
                {
                    $match: {

                        isDeleted: false,

                    },

                },

                {
                    $group: {

                        _id: '$staffId',

                        totalCommission: {

                            $sum:
                                '$commissionAmount',

                        },

                        totalServices: {

                            $sum: 1,

                        },

                    },

                },

                {
                    $sort: {

                        totalCommission: -1,

                    },

                },

                {
                    $limit: 10,

                },

                {
                    $lookup: {
                        from: 'staffs',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'staff',

                    },

                },

                {
                    $unwind: '$staff',

                },

            ]);

        return {
            success: true,
            message:
                'Top performing staff fetched successfully.',
            data:
                topStaff,

        };

    }

    async searchCommissions(
        query: GetCommissionsDto,
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

            filter.$or = [

                {

                    commissionId: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    commissionStatus: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    remarks: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

            ];

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalCommissions =
            await this.commissionModel
                .countDocuments(
                    filter,
                );

        const commissions =
            await this.commissionModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('staffId')
                .populate('branchId')
                .populate('appointmentId')
                .populate('serviceId')
                .populate('invoiceId');

        return {

            success: true,

            message:
                'Commissions fetched successfully.',

            data:
                commissions,

            pagination: {

                total:
                    totalCommissions,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalCommissions /
                        limit,
                    ),

            },

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetCommissionsDto,
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

            filter.$or = [

                {

                    commissionId: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    commissionStatus: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

                {

                    remarks: {

                        $regex:
                            query.search,

                        $options:
                            'i',

                    },

                },

            ];

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalCommissions =
            await this.commissionModel
                .countDocuments(
                    filter,
                );

        const commissions =
            await this.commissionModel

                .find(filter)

                .sort(sort)

                .skip(skip)

                .limit(limit)

                .populate('staffId')
                .populate('branchId')
                .populate('appointmentId')
                .populate('serviceId')
                .populate('invoiceId');

        return {

            success: true,

            message:
                'Commissions fetched successfully.',

            data:
                commissions,

            pagination: {

                total:
                    totalCommissions,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalCommissions /
                        limit,
                    ),

            },

        };

    }

    async updateCommissionStatus(
        user: any,
        id: string,
        dto: UpdateCommissionStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const commission =
            await this.commissionModel.findById(
                id,
            );

        if (!commission) {

            throw new BadRequestException(
                'Commission not found.',
            );

        }

        Object.assign(
            commission,
            dto,
        );

        await commission.save();
        return {
            success: true,
            message:
                'Commission status updated successfully.',
            data:
                commission,

        };

    }

    async deleteCommissionByAdmin(
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

        const commission =
            await this.commissionModel.findById(
                id,
            );

        if (!commission) {

            throw new BadRequestException(
                'Commission not found.',
            );

        }

        commission.isDeleted = true;
        commission.isActive = false;
        await commission.save();
        return {
            success: true,
            message:
                'Commission deleted successfully.',
            data: {
                commissionId:
                    commission.commissionId,

            },

        };

    }

}