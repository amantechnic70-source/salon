import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { Model, Types } from 'mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { Service, ServiceDocument } from 'src/schemas/service.schema';
import { Membership, MembershipDocument } from 'src/schemas/membership.schema';
import { Coupon, CouponDocument } from 'src/schemas/coupon.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class AppointmentsService {

    constructor(
        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,

        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Membership.name)
        private readonly membershipModel:
            Model<MembershipDocument>,

        @InjectModel(Coupon.name)
        private readonly couponModel:
            Model<CouponDocument>,
    ) { }

    async create(
        userId: string,
        dto: CreateAppointmentDto,
    ) {

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {
            throw new BadRequestException(
                'Salon not found.',
            );
        }

        const branch = await this.branchModel.findOne({
            _id: dto.branchId,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!branch) {
            throw new BadRequestException(
                'Branch not found.',
            );
        }

        const customer = await this.customerModel.findOne({
            _id: dto.customerId,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!customer) {
            throw new BadRequestException(
                'Customer not found.',
            );
        }

        const staff = await this.staffModel.findOne({
            _id: dto.staffId,
            salonId: salon._id,
            isDeleted: false,
        });

        if (!staff) {
            throw new BadRequestException(
                'Staff not found.',
            );
        }

        const services =
            await this.serviceModel.find({

                _id: {
                    $in: dto.serviceIds,
                },

                salonId: salon._id,

                isDeleted: false,

            });

        if (
            services.length !==
            dto.serviceIds.length
        ) {
            throw new BadRequestException(
                'Invalid services selected.',
            );
        }

        let totalAmount = 0;

        services.forEach((service) => {
            totalAmount += service.price;
        });

        let discountAmount = 0;

        let membershipId: Types.ObjectId | undefined;

        let couponId: Types.ObjectId | undefined;

        if (dto.membershipId) {

            const membership =
                await this.membershipModel.findOne({

                    _id: dto.membershipId,

                    customerId: customer._id,

                    isActive: true,

                }).populate(
                    'membershipPlanId',
                );

            if (!membership) {
                throw new BadRequestException(
                    'Invalid membership.',
                );
            }

            const membershipPlan: any =
                membership.membershipPlanId;

            const membershipDiscount =
                (totalAmount *
                    membershipPlan.discountPercentage)
                / 100;

            discountAmount +=
                membershipDiscount;

            membershipId =
                membership._id;

        }

        if (dto.couponId) {

            const coupon =
                await this.couponModel.findOne({

                    _id: dto.couponId,

                    isDeleted: false,

                    isActive: true,

                });

            if (!coupon) {
                throw new BadRequestException(
                    'Invalid coupon.',
                );
            }

            if (
                new Date(coupon.expiryDate)
                < new Date()
            ) {
                throw new BadRequestException(
                    'Coupon has expired.',
                );
            }

            let couponDiscount = 0;

            if (
                coupon.discountType ===
                'FLAT'
            ) {

                couponDiscount =
                    coupon.discountValue;

            }

            if (
                coupon.discountType ===
                'PERCENTAGE'
            ) {

                couponDiscount =
                    (totalAmount *
                        coupon.discountValue)
                    / 100;

                if (
                    couponDiscount >
                    coupon.maximumDiscount
                ) {

                    couponDiscount =
                        coupon.maximumDiscount;

                }

            }

            discountAmount +=
                couponDiscount;

            couponId =
                coupon._id;

        }

        const finalAmount =
            totalAmount -
            discountAmount;

        const totalAppointments =
            await this.appointmentModel
                .countDocuments();

        const appointmentId =
            `APP${String(
                totalAppointments + 1,
            ).padStart(6, '0')}`;

        const appointment =
            await this.appointmentModel.create({

                appointmentId,

                salonId: salon._id,

                branchId:
                    branch._id,

                customerId:
                    customer._id,

                staffId:
                    staff._id,

                serviceIds:
                    dto.serviceIds,

                membershipId,

                couponId,

                appointmentDate:
                    dto.appointmentDate,

                appointmentTime:
                    dto.appointmentTime,

                totalAmount,

                discountAmount,

                finalAmount,

                paymentStatus:
                    'PENDING',

                appointmentStatus:
                    'PENDING',

                notes:
                    dto.notes,

            });

        return {

            success: true,

            message:
                'Appointment created successfully.',

            data: appointment,

        };

    }

    async getAll(
        userId: string,
        query: GetAppointmentsDto,
    ) {

        const salon = await this.salonModel.findOne({
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
            salonId: salon._id,
            isDeleted: false,
        };

        if (query.search) {

            filter.appointmentId = {

                $regex: query.search,

                $options: 'i',

            };

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalAppointments =
            await this.appointmentModel
                .countDocuments(
                    filter,
                );

        const appointments =
            await this.appointmentModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('branchId')
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds')
                .populate('membershipId')
                .populate('couponId');

        return {

            success: true,

            message:
                'Appointments fetched successfully.',

            data:
                appointments,

            pagination: {

                total:
                    totalAppointments,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalAppointments /
                        limit,
                    ),

            },

        };

    }

    async getById(
        userId: string,
        id: string,
    ) {

        const salon = await this.salonModel.findOne({
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
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            })
                .populate('branchId')
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds')
                .populate('membershipId')
                .populate('couponId');

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        return {
            success: true,
            message:
                'Appointment fetched successfully.',
            data: appointment,
        };

    }

    async update(
        userId: string,
        id: string,
        dto: UpdateAppointmentDto,
    ) {

        const salon = await this.salonModel.findOne({
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
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        if (appointment.isCompleted) {
            throw new BadRequestException(
                'Completed appointment cannot be updated.',
            );
        }

        if (appointment.isCancelled) {
            throw new BadRequestException(
                'Cancelled appointment cannot be updated.',
            );
        }

        Object.assign(
            appointment,
            dto,
        );

        await appointment.save();

        return {
            success: true,
            message:
                'Appointment updated successfully.',
            data: appointment,
        };

    }

    async rescheduleAppointment(
        userId: string,
        id: string,
        dto: RescheduleAppointmentDto,
    ) {

        const salon = await this.salonModel.findOne({
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
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        if (appointment.isCompleted) {
            throw new BadRequestException(
                'Completed appointment cannot be rescheduled.',
            );
        }

        if (appointment.isCancelled) {
            throw new BadRequestException(
                'Cancelled appointment cannot be rescheduled.',
            );
        }

        appointment.appointmentDate =
            dto.appointmentDate;

        appointment.appointmentTime =
            dto.appointmentTime;

        appointment.appointmentStatus =
            'RESCHEDULED';

        await appointment.save();

        return {
            success: true,
            message:
                'Appointment rescheduled successfully.',
            data: appointment,
        };

    }

    async updateAppointmentStatus(
        userId: string,
        id: string,
        dto: UpdateAppointmentStatusDto,
    ) {

        const salon = await this.salonModel.findOne({
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
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        Object.assign(
            appointment,
            dto,
        );

        await appointment.save();

        return {
            success: true,
            message:
                'Appointment status updated successfully.',
            data: appointment,
        };

    }

    async cancelAppointment(
        userId: string,
        id: string,
        dto: CancelAppointmentDto,
    ) {

        const salon = await this.salonModel.findOne({
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
                _id: id,
                salonId: salon._id,
                isDeleted: false,
            });

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        if (appointment.isCompleted) {
            throw new BadRequestException(
                'Completed appointment cannot be cancelled.',
            );
        }

        if (appointment.isCancelled) {
            throw new BadRequestException(
                'Appointment is already cancelled.',
            );
        }

        appointment.isCancelled = true;

        appointment.appointmentStatus =
            'CANCELLED';

        appointment.notes = dto.reason;

        await appointment.save();

        return {
            success: true,
            message:
                'Appointment cancelled successfully.',
            data: appointment,
        };

    }

    async searchAppointments(
        query: GetAppointmentsDto,
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
            filter.appointmentId = {
                $regex: query.search,
                $options: 'i',
            };
        }

        const sort: any = {
            [query.sortBy || 'createdAt']:
                query.sortOrder === 'asc'
                    ? 1
                    : -1,
        };

        const totalAppointments =
            await this.appointmentModel
                .countDocuments(
                    filter,
                );

        const appointments =
            await this.appointmentModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('salonId')
                .populate('branchId')
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds')
                .populate('membershipId')
                .populate('couponId');

        return {
            success: true,
            message:
                'Appointments fetched successfully.',
            data: appointments,
            pagination: {
                total:
                    totalAppointments,
                page,
                limit,
                totalPages:
                    Math.ceil(
                        totalAppointments /
                        limit,
                    ),
            },
        };

    }

    async getTodayAppointments() {

        const startOfDay = new Date();

        startOfDay.setHours(
            0,
            0,
            0,
            0,
        );

        const endOfDay = new Date();

        endOfDay.setHours(
            23,
            59,
            59,
            999,
        );

        const appointments =
            await this.appointmentModel
                .find({

                    appointmentDate: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },

                    isDeleted: false,

                })

                .populate('salonId')
                .populate('branchId')
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds')
                .populate('membershipId')
                .populate('couponId');

        return {

            success: true,

            message:
                'Today appointments fetched successfully.',

            data:
                appointments,

        };

    }

    async getUpcomingAppointments() {

        const today = new Date();

        today.setHours(
            23,
            59,
            59,
            999,
        );

        const appointments =
            await this.appointmentModel
                .find({

                    appointmentDate: {
                        $gt: today,
                    },

                    isDeleted: false,

                    isCancelled: false,

                })

                .sort({
                    appointmentDate: 1,
                })

                .populate('salonId')
                .populate('branchId')
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds')
                .populate('membershipId')
                .populate('couponId');

        return {

            success: true,

            message:
                'Upcoming appointments fetched successfully.',

            data:
                appointments,

        };

    }

    async getAllByAdmin(
        user: any,
        query: GetAppointmentsDto,
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

            filter.appointmentId = {

                $regex: query.search,

                $options: 'i',

            };

        }

        const sort: any = {

            [query.sortBy || 'createdAt']:

                query.sortOrder === 'asc'
                    ? 1
                    : -1,

        };

        const totalAppointments =
            await this.appointmentModel
                .countDocuments(
                    filter,
                );

        const appointments =
            await this.appointmentModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('salonId')
                .populate('branchId')
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds')
                .populate('membershipId')
                .populate('couponId');

        return {

            success: true,

            message:
                'Appointments fetched successfully.',

            data:
                appointments,

            pagination: {

                total:
                    totalAppointments,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        totalAppointments /
                        limit,
                    ),

            },

        };

    }

    async updateStatusByAdmin(
        user: any,
        id: string,
        dto: UpdateAppointmentStatusDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const appointment =
            await this.appointmentModel.findById(
                id,
            );

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        Object.assign(
            appointment,
            dto,
        );

        await appointment.save();

        return {
            success: true,
            message:
                'Appointment status updated successfully.',
            data: appointment,
        };

    }

    async deleteByAdmin(
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

        const appointment =
            await this.appointmentModel.findById(
                id,
            );

        if (!appointment) {
            throw new BadRequestException(
                'Appointment not found.',
            );
        }

        appointment.isDeleted = true;

        appointment.isCancelled = true;

        appointment.appointmentStatus =
            'DELETED';

        await appointment.save();

        return {
            success: true,
            message:
                'Appointment deleted successfully.',
        };

    }

}