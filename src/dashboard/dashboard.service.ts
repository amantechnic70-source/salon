import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { GetDashboardDto } from './dto/get-dashboard.dto';
import { GetRevenueStatsDto } from './dto/get-revenue-stats.dto';
import { GetMonthlyReportDto } from './dto/get-monthly-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { Service, ServiceDocument } from 'src/schemas/service.schema';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { Commission, CommissionDocument } from 'src/schemas/commission.schema';
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { Membership, MembershipDocument } from 'src/schemas/membership.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class DashboardService {

    constructor(
        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,

        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Invoice.name)
        private readonly invoiceModel:
            Model<InvoiceDocument>,

        @InjectModel(Commission.name)
        private readonly commissionModel:
            Model<CommissionDocument>,

        @InjectModel(Review.name)
        private readonly reviewModel:
            Model<ReviewDocument>,

        @InjectModel(Membership.name)
        private readonly membershipModel:
            Model<MembershipDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,
    ) { }

    async getOverview(
        userId: string,
        query: GetDashboardDto,
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

        const totalRevenue =
            await this.invoiceModel.aggregate([

                {
                    $match: {

                        salonId: salon._id,

                        isDeleted: false,

                    },

                },

                {
                    $group: {

                        _id: null,

                        total: {

                            $sum: '$finalAmount',

                        },

                    },

                },

            ]);

        const totalCustomers =
            await this.customerModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        const totalAppointments =
            await this.appointmentModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        const totalStaff =
            await this.staffModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        const totalServices =
            await this.serviceModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        const totalCommissions =
            await this.commissionModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        const totalReviews =
            await this.reviewModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        const totalMemberships =
            await this.membershipModel
                .countDocuments({

                    isActive: true,

                });

        const totalBranches =
            await this.branchModel
                .countDocuments({

                    salonId: salon._id,

                    isDeleted: false,

                });

        return {

            success: true,

            message:
                'Dashboard overview fetched successfully.',

            data: {

                totalRevenue:
                    totalRevenue[0]?.total || 0,

                totalCustomers,

                totalAppointments,

                totalStaff,

                totalServices,

                totalCommissions,

                totalReviews,

                totalMemberships,

                totalBranches,

            },

        };

    }

    async getTodayStats(
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

        const startOfDay =
            new Date();

        startOfDay.setHours(
            0,
            0,
            0,
            0,
        );

        const endOfDay =
            new Date();

        endOfDay.setHours(
            23,
            59,
            59,
            999,
        );

        const todayRevenue =
            await this.invoiceModel.aggregate([

                {

                    $match: {

                        salonId: salon._id,

                        createdAt: {

                            $gte:
                                startOfDay,

                            $lte:
                                endOfDay,

                        },

                        isDeleted: false,

                    },

                },

                {

                    $group: {

                        _id: null,

                        total: {

                            $sum:
                                '$finalAmount',

                        },

                    },

                },

            ]);

        const todayAppointments =
            await this.appointmentModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startOfDay,

                        $lte:
                            endOfDay,

                    },

                    isDeleted: false,

                });

        const todayCustomers =
            await this.customerModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startOfDay,

                        $lte:
                            endOfDay,

                    },

                    isDeleted: false,

                });

        const todayReviews =
            await this.reviewModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startOfDay,

                        $lte:
                            endOfDay,

                    },

                    isDeleted: false,

                });

        const todayCommissions =
            await this.commissionModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startOfDay,

                        $lte:
                            endOfDay,

                    },

                    isDeleted: false,

                });

        const todayMemberships =
            await this.membershipModel
                .countDocuments({

                    createdAt: {

                        $gte:
                            startOfDay,

                        $lte:
                            endOfDay,

                    },

                });

        return {

            success: true,

            message:
                'Today statistics fetched successfully.',

            data: {

                todayRevenue:
                    todayRevenue[0]?.total || 0,

                todayAppointments,

                todayCustomers,

                todayReviews,

                todayCommissions,

                todayMemberships,

            },

        };

    }

    async getRevenueStats(
        userId: string,
        query: GetRevenueStatsDto,
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

        const month =
            Number(query.month) ||
            new Date().getMonth() + 1;

        const year =
            Number(query.year) ||
            new Date().getFullYear();

        const startDate =
            new Date(
                year,
                month - 1,
                1,
            );

        const endDate =
            new Date(
                year,
                month,
                0,
                23,
                59,
                59,
                999,
            );

        const invoices =
            await this.invoiceModel.find({

                salonId: salon._id,

                createdAt: {

                    $gte: startDate,

                    $lte: endDate,

                },

                isDeleted: false,

            });

        const totalRevenue =
            invoices.reduce(

                (sum, invoice) =>
                    sum +
                    invoice.finalAmount,

                0,

            );

        const totalInvoices =
            invoices.length;

        const averageRevenue =
            totalInvoices > 0

                ? Number(
                    (
                        totalRevenue /
                        totalInvoices
                    ).toFixed(2),
                )

                : 0;

        return {

            success: true,

            message:
                'Revenue statistics fetched successfully.',

            data: {

                month,

                year,

                totalRevenue,

                totalInvoices,

                averageRevenue,

            },

        };

    }

    async getCustomerStats(
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

        const customers =
            await this.customerModel.find({

                salonId: salon._id,

                isDeleted: false,

            });

        const totalCustomers =
            customers.length;

        const activeCustomers =
            customers.filter(
                customer =>
                    customer.isActive,
            ).length;

        const totalSpent =
            customers.reduce(

                (sum, customer) =>
                    sum +
                    customer.totalSpent,

                0,

            );

        const totalLoyaltyPoints =
            customers.reduce(

                (sum, customer) =>
                    sum +
                    customer.loyaltyPoints,

                0,

            );

        return {

            success: true,

            message:
                'Customer statistics fetched successfully.',

            data: {

                totalCustomers,

                activeCustomers,

                totalSpent,

                totalLoyaltyPoints,

            },

        };

    }

    async getAppointmentStats(
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

        const appointments =
            await this.appointmentModel.find({

                salonId: salon._id,

                isDeleted: false,

            });

        const totalAppointments =
            appointments.length;

        const completedAppointments =
            appointments.filter(
                appointment =>
                    appointment.isCompleted,
            ).length;


        const cancelledAppointments =
            appointments.filter(
                appointment =>
                    appointment.isCancelled,
            ).length;


        const pendingAppointments =
            appointments.filter(
                appointment =>
                    !appointment.isCompleted &&
                    !appointment.isCancelled,
            ).length;

        return {

            success: true,

            message:
                'Appointment statistics fetched successfully.',

            data: {

                totalAppointments,
                completedAppointments,
                pendingAppointments,
                cancelledAppointments,

            },

        };

    }

    async getStaffStats(
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

        const staffs =
            await this.staffModel.find({
                salonId: salon._id,
                isDeleted: false,

            });

        const totalStaff =
            staffs.length;

        const activeStaff =
            staffs.filter(
                staff => staff.isActive,
            ).length;

        const inactiveStaff =
            staffs.filter(
                staff => !staff.isActive,
            ).length;

        const totalSalary =
            staffs.reduce(
                (sum, staff) =>
                    sum + (staff.salary || 0),

                0,

            );

        return {

            success: true,
            message:
                'Staff statistics fetched successfully.',

            data: {
                totalStaff,
                activeStaff,
                inactiveStaff,
                totalSalary,

            },

        };

    }

    async getServiceStats(
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

        const services =
            await this.serviceModel.find({
                salonId: salon._id,
                isDeleted: false,

            });

        const totalServices =
            services.length;

        const activeServices =
            services.filter(
                service => service.isActive,
            ).length;

        const totalServiceValue =
            services.reduce(

                (sum, service) =>
                    sum + (service.price || 0),

                0,

            );

        const averageServicePrice =
            totalServices > 0

                ? Number(
                    (
                        totalServiceValue /
                        totalServices
                    ).toFixed(2),
                )

                : 0;

        return {

            success: true,
            message:
                'Service statistics fetched successfully.',

            data: {
                totalServices,
                activeServices,
                totalServiceValue,
                averageServicePrice,

            },

        };

    }

    async getCommissionStats(
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

        const commissions =
            await this.commissionModel.find({
                salonId: salon._id,
                isDeleted: false,

            });

        const totalCommissions =
            commissions.length;

        const totalCommissionAmount =
            commissions.reduce(

                (sum, commission) =>
                    sum +
                    commission.commissionAmount,

                0,

            );

        const paidCommissions =
            commissions.filter(
                commission =>
                    commission.isPaid,
            );

        const pendingCommissions =
            commissions.filter(
                commission =>
                    !commission.isPaid,
            );

        const totalPaidAmount =
            paidCommissions.reduce(

                (sum, commission) =>
                    sum +
                    commission.commissionAmount,

                0,

            );

        const totalPendingAmount =
            pendingCommissions.reduce(

                (sum, commission) =>
                    sum +
                    commission.commissionAmount,

                0,

            );

        return {

            success: true,
            message:
                'Commission statistics fetched successfully.',
            data: {
                totalCommissions,
                totalCommissionAmount,
                totalPaidCommissions:
                    paidCommissions.length,
                totalPendingCommissions:
                    pendingCommissions.length,
                totalPaidAmount,
                totalPendingAmount,

            },

        };

    }

    async getReviewStats(
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

        const reviews =
            await this.reviewModel.find({

                salonId: salon._id,

                isDeleted: false,

            });

        const totalReviews =
            reviews.length;

        const averageRating =
            totalReviews > 0

                ? Number(

                    (
                        reviews.reduce(

                            (sum, review) =>
                                sum + review.rating,

                            0,

                        ) / totalReviews

                    ).toFixed(1),

                )

                : 0;

        const fiveStarReviews =
            reviews.filter(
                review =>
                    review.rating === 5,
            ).length;

        const fourStarReviews =
            reviews.filter(
                review =>
                    review.rating === 4,
            ).length;

        const threeStarReviews =
            reviews.filter(
                review =>
                    review.rating === 3,
            ).length;

        const twoStarReviews =
            reviews.filter(
                review =>
                    review.rating === 2,
            ).length;

        const oneStarReviews =
            reviews.filter(
                review =>
                    review.rating === 1,
            ).length;

        return {

            success: true,

            message:
                'Review statistics fetched successfully.',

            data: {
                totalReviews,
                averageRating,
                fiveStarReviews,
                fourStarReviews,
                threeStarReviews,
                twoStarReviews,
                oneStarReviews,

            },

        };

    }

    async getMembershipStats(
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

        const plans =
            await this.membershipModel.find({

                salonId: salon._id,

                isDeleted: false,

            });

        const memberships =
            await this.membershipModel.find({

                isActive: true,

            });

        const totalMembershipPlans =
            plans.length;

        const totalMemberships =
            memberships.length;

        const activeMemberships =
            memberships.filter(
                membership =>
                    membership.isActive,
            ).length;

        const totalMembershipRevenue =
            memberships.reduce(

                (sum, membership) =>
                    sum +
                    membership.amount,

                0,

            );

        return {

            success: true,

            message:
                'Membership statistics fetched successfully.',

            data: {

                totalMembershipPlans,

                totalMemberships,

                activeMemberships,

                totalMembershipRevenue,

            },

        };

    }

    async getBranchStats(
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

        const branches =
            await this.branchModel.find({

                salonId: salon._id,

                isDeleted: false,

            });

        const totalBranches =
            branches.length;

        const activeBranches =
            branches.filter(
                branch =>
                    branch.isActive,
            ).length;

        const inactiveBranches =
            branches.filter(
                branch =>
                    !branch.isActive,
            ).length;

        return {

            success: true,

            message:
                'Branch statistics fetched successfully.',

            data: {

                totalBranches,

                activeBranches,

                inactiveBranches,

            },

        };

    }

    async getTopPerformingStaff(
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

        const topStaff =
            await this.commissionModel.aggregate([

                {
                    $match: {

                        salonId: salon._id,

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

    async getTopSellingServices(
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

        const services =
            await this.appointmentModel.aggregate([

                {
                    $match: {
                        salonId: salon._id,
                        isDeleted: false,

                    },

                },

                {
                    $unwind: '$serviceIds',

                },

                {
                    $group: {

                        _id: '$serviceIds',

                        totalBookings: {

                            $sum: 1,

                        },

                    },

                },

                {
                    $sort: {

                        totalBookings: -1,

                    },

                },

                {
                    $limit: 10,

                },

                {
                    $lookup: {

                        from: 'services',

                        localField: '_id',

                        foreignField: '_id',

                        as: 'service',

                    },

                },

                {
                    $unwind: '$service',

                },

            ]);

        return {

            success: true,

            message:
                'Top selling services fetched successfully.',

            data:
                services,

        };

    }

    async getMonthlyReport(
        userId: string,
        query: GetMonthlyReportDto,
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

        const month =
            Number(query.month) ||
            new Date().getMonth() + 1;

        const year =
            Number(query.year) ||
            new Date().getFullYear();

        const startDate =
            new Date(
                year,
                month - 1,
                1,
            );

        const endDate =
            new Date(
                year,
                month,
                0,
                23,
                59,
                59,
                999,
            );

        const revenue =
            await this.invoiceModel.aggregate([

                {

                    $match: {

                        salonId: salon._id,

                        createdAt: {

                            $gte:
                                startDate,

                            $lte:
                                endDate,

                        },

                        isDeleted: false,

                    },

                },

                {

                    $group: {

                        _id: null,

                        totalRevenue: {

                            $sum:
                                '$finalAmount',

                        },

                    },

                },

            ]);

        const totalCustomers =
            await this.customerModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startDate,

                        $lte:
                            endDate,

                    },

                    isDeleted: false,

                });

        const totalAppointments =
            await this.appointmentModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startDate,

                        $lte:
                            endDate,

                    },

                    isDeleted: false,

                });

        const totalCommissions =
            await this.commissionModel
                .countDocuments({

                    salonId: salon._id,

                    createdAt: {

                        $gte:
                            startDate,

                        $lte:
                            endDate,

                    },

                    isDeleted: false,

                });

        return {

            success: true,

            message:
                'Monthly report fetched successfully.',

            data: {

                month,

                year,

                totalRevenue:
                    revenue[0]?.totalRevenue || 0,
                totalCustomers,
                totalAppointments,
                totalCommissions,

            },

        };

    }

    async getAdminOverview(
        user: any,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {

            throw new UnauthorizedException(
                'Unauthorized.',
            );

        }

        const totalSalons =
            await this.salonModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalCustomers =
            await this.customerModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalStaff =
            await this.staffModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalAppointments =
            await this.appointmentModel
                .countDocuments({

                    isDeleted: false,

                });

        const totalRevenue =
            await this.invoiceModel.aggregate([

                {

                    $match: {

                        isDeleted: false,

                    },

                },

                {

                    $group: {

                        _id: null,

                        amount: {

                            $sum:
                                '$finalAmount',

                        },

                    },

                },

            ]);

        return {

            success: true,
            message:
                'Admin dashboard fetched successfully.',
            data: {
                totalSalons,
                totalCustomers,
                totalStaff,
                totalAppointments,
                totalRevenue:
                    totalRevenue[0]?.amount || 0,

            },

        };

    }

}