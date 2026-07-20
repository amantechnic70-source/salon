import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { GetRevenueReportDto } from './dto/get-revenue-report.dto';
import { GetCustomerReportDto } from './dto/get-customer-report.dto';
import { GetStaffReportDto } from './dto/get-staff-report.dto';
import { GetAppointmentReportDto } from './dto/get-appointment-report.dto';
import { GetAttendanceReportDto } from './dto/get-attendance-report.dto';
import { GetMonthlyReportDto } from './dto/get-monthly-report.dto';
import { GetYearlyReportDto } from './dto/get-yearly-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Salon, SalonDocument } from 'src/schemas/salon.schema';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from 'src/schemas/invoice.schema';
import { Customer, CustomerDocument } from 'src/schemas/customer.schema';
import { Staff, StaffDocument } from 'src/schemas/staff.schema';
import { Appointment, AppointmentDocument } from 'src/schemas/appointment.schema';
import { Attendance, AttendanceDocument } from 'src/schemas/attendance.schema';
import { Membership, MembershipDocument } from 'src/schemas/membership.schema';
import { MembershipPlan, MembershipPlanDocument } from 'src/schemas/membership-plan.schema';
import { Commission, CommissionDocument } from 'src/schemas/commission.schema';
import { Service, ServiceDocument } from 'src/schemas/service.schema';
import { Branch, BranchDocument } from 'src/schemas/branch.schema';
import { Coupon, CouponDocument } from 'src/schemas/coupon.schema';
import { Review, ReviewDocument } from 'src/schemas/review.schema';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class ReportsService {

    constructor(
        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Invoice.name)
        private readonly invoiceModel:
            Model<InvoiceDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Attendance.name)
        private readonly attendanceModel:
            Model<AttendanceDocument>,

        @InjectModel(Membership.name)
        private readonly membershipModel:
            Model<MembershipDocument>,

        @InjectModel(MembershipPlan.name)
        private readonly membershipPlanModel:
            Model<MembershipPlanDocument>,

        @InjectModel(Commission.name)
        private readonly commissionModel:
            Model<CommissionDocument>,

        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Coupon.name)
        private readonly couponModel:
            Model<CouponDocument>,

        @InjectModel(Review.name)
        private readonly reviewModel:
            Model<ReviewDocument>,

    ) { }

    async getRevenueReport(
        userId: string,
        query: GetRevenueReportDto,
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

                    $gte:
                        startDate,

                    $lte:
                        endDate,

                },

                isDeleted: false,

            });

        const totalInvoices =
            invoices.length;

        const totalRevenue =
            invoices.reduce(

                (sum, invoice) =>
                    sum +
                    invoice.finalAmount,

                0,

            );

        const averageInvoiceAmount =
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
                'Revenue report fetched successfully.',

            data: {

                month,

                year,

                totalInvoices,

                totalRevenue,

                averageInvoiceAmount,

                invoices,

            },

        };

    }

    async getCustomerReport(
        userId: string,
        query: GetCustomerReportDto,
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

        const filter: any = {

            salonId: salon._id,

            isDeleted: false,

        };

        if (
            query.startDate &&
            query.endDate
        ) {

            filter.createdAt = {

                $gte:
                    new Date(
                        query.startDate,
                    ),

                $lte:
                    new Date(
                        query.endDate,
                    ),

            };

        }

        const customers =
            await this.customerModel.find(
                filter,
            );

        const totalCustomers =
            customers.length;

        const activeCustomers =
            customers.filter(
                customer =>
                    customer.isActive,
            ).length;

        const inactiveCustomers =
            customers.filter(
                customer =>
                    !customer.isActive,
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
                'Customer report fetched successfully.',

            data: {

                totalCustomers,

                activeCustomers,

                inactiveCustomers,

                totalSpent,

                totalLoyaltyPoints,

                customers,

            },

        };

    }

    async getStaffReport(
        userId: string,
        query: GetStaffReportDto,
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

        const filter: any = {

            salonId: salon._id,

            isDeleted: false,

        };

        if (query.branchId) {

            filter.branchId =
                query.branchId;

        }

        const staffs =
            await this.staffModel.find(
                filter,
            ).populate('branchId');

        const totalStaff =
            staffs.length;

        const activeStaff =
            staffs.filter(
                staff =>
                    staff.isActive,
            ).length;

        const inactiveStaff =
            staffs.filter(
                staff =>
                    !staff.isActive,
            ).length;

        const totalSalary =
            staffs.reduce(

                (sum, staff) =>
                    sum +
                    (staff.salary || 0),

                0,

            );

        return {

            success: true,

            message:
                'Staff report fetched successfully.',

            data: {

                totalStaff,

                activeStaff,

                inactiveStaff,

                totalSalary,

                staffs,

            },

        };

    }

    async getAppointmentReport(
        userId: string,
        query: GetAppointmentReportDto,
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

        const filter: any = {

            salonId: salon._id,

            isDeleted: false,

        };

        if (
            query.startDate &&
            query.endDate
        ) {

            filter.createdAt = {

                $gte:
                    new Date(
                        query.startDate,
                    ),

                $lte:
                    new Date(
                        query.endDate,
                    ),

            };

        }

        const appointments =
            await this.appointmentModel
                .find(filter)
                .populate('customerId')
                .populate('staffId')
                .populate('serviceIds');

        const totalAppointments =
            appointments.length;

        const completedAppointments =
            appointments.filter(
                item =>
                    item.isCompleted,
            ).length;

        const cancelledAppointments =
            appointments.filter(
                item =>
                    item.isCancelled,
            ).length;

        const pendingAppointments =
            appointments.filter(
                item =>
                    !item.isCompleted &&
                    !item.isCancelled,
            ).length;

        return {

            success: true,

            message:
                'Appointment report fetched successfully.',

            data: {

                totalAppointments,
                completedAppointments,
                pendingAppointments,
                cancelledAppointments,
                appointments,

            },

        };

    }

    async getAttendanceReport(
        userId: string,
        query: GetAttendanceReportDto,
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

        const attendance =
            await this.attendanceModel
                .find({

                    salonId: salon._id,

                    date: {

                        $gte:
                            startDate,

                        $lte:
                            endDate,

                    },

                    isDeleted: false,

                })

                .populate('staffId')
                .populate('branchId');

        const totalAttendance =
            attendance.length;

        const presentCount =
            attendance.filter(
                item =>
                    item.status ===
                    'PRESENT',
            ).length;

        const halfDayCount =
            attendance.filter(
                item =>
                    item.status ===
                    'HALF_DAY',
            ).length;

        const lateEntries =
            attendance.filter(
                item =>
                    item.isLate,
            ).length;

        const totalWorkingHours =
            attendance.reduce(

                (sum, item) =>
                    sum +
                    (item.workingHours || 0),

                0,

            );

        return {

            success: true,

            message:
                'Attendance report fetched successfully.',

            data: {

                month,

                year,

                totalAttendance,

                presentCount,

                halfDayCount,

                lateEntries,

                totalWorkingHours,

                attendance,

            },

        };

    }

    async getInvoiceReport(
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

        const invoices =
            await this.invoiceModel

                .find({

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate('appointmentId')
                .populate('customerId')
                .populate('branchId');

        const totalInvoices =
            invoices.length;

        const totalRevenue =
            invoices.reduce(

                (sum, invoice) =>
                    sum +
                    invoice.finalAmount,

                0,

            );

        const totalTaxAmount =
            invoices.reduce(

                (sum, invoice) =>
                    sum +
                    invoice.taxAmount,

                0,

            );

        const totalDiscountAmount =
            invoices.reduce(

                (sum, invoice) =>
                    sum +
                    invoice.discountAmount,

                0,

            );

        const paidInvoices =
            invoices.filter(
                invoice =>
                    invoice.paymentStatus ===
                    'PAID',
            ).length;

        const pendingInvoices =
            invoices.filter(
                invoice =>
                    invoice.paymentStatus ===
                    'PENDING',
            ).length;

        return {

            success: true,

            message:
                'Invoice report fetched successfully.',

            data: {

                totalInvoices,

                totalRevenue,

                totalTaxAmount,

                totalDiscountAmount,

                paidInvoices,

                pendingInvoices,

                invoices,

            },

        };

    }

    async getMembershipReport(
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
            await this.membershipPlanModel.find({

                salonId: salon._id,

                isDeleted: false,

            });

        const memberships =
            await this.membershipModel

                .find({

                    isActive: true,

                })

                .populate(
                    'membershipPlanId',
                )

                .populate(
                    'customerId',
                );

        const totalMembershipPlans =
            plans.length;

        const totalMemberships =
            memberships.length;

        const activeMemberships =
            memberships.filter(
                membership =>
                    membership.isActive,
            ).length;

        const totalRevenue =
            memberships.reduce(

                (sum, membership) =>
                    sum +
                    membership.amount,

                0,

            );

        return {

            success: true,

            message:
                'Membership report fetched successfully.',

            data: {

                totalMembershipPlans,

                totalMemberships,

                activeMemberships,

                totalRevenue,

                memberships,

            },

        };

    }

    async getCommissionReport(
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
            await this.commissionModel

                .find({

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate('staffId')
                .populate('serviceId')
                .populate('invoiceId');

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
            ).length;

        const pendingCommissions =
            commissions.filter(
                commission =>
                    !commission.isPaid,
            ).length;

        const totalPaidAmount =
            commissions

                .filter(
                    commission =>
                        commission.isPaid,
                )

                .reduce(

                    (sum, commission) =>
                        sum +
                        commission.commissionAmount,

                    0,

                );

        const totalPendingAmount =
            commissions

                .filter(
                    commission =>
                        !commission.isPaid,
                )

                .reduce(

                    (sum, commission) =>
                        sum +
                        commission.commissionAmount,

                    0,

                );

        return {

            success: true,

            message:
                'Commission report fetched successfully.',

            data: {

                totalCommissions,

                totalCommissionAmount,

                paidCommissions,

                pendingCommissions,

                totalPaidAmount,

                totalPendingAmount,

                commissions,

            },

        };

    }

    async getServiceReport(
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
                service =>
                    service.isActive,
            ).length;

        const inactiveServices =
            services.filter(
                service =>
                    !service.isActive,
            ).length;

        const totalServiceValue =
            services.reduce(

                (sum, service) =>
                    sum +
                    (service.price || 0),

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
                'Service report fetched successfully.',

            data: {

                totalServices,
                activeServices,
                inactiveServices,
                totalServiceValue,
                averageServicePrice,
                services,

            },

        };

    }

    async getBranchReport(
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
                'Branch report fetched successfully.',

            data: {

                totalBranches,
                activeBranches,
                inactiveBranches,
                branches,

            },

        };

    }

    async getCouponReport(
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

        const coupons =
            await this.couponModel.find({
                salonId: salon._id,
                isDeleted: false,

            });

        const totalCoupons =
            coupons.length;

        const activeCoupons =
            coupons.filter(
                coupon =>
                    coupon.isActive,
            ).length;

        const expiredCoupons =
            coupons.filter(
                coupon =>
                    coupon.expiryDate &&
                    new Date(
                        coupon.expiryDate,
                    ) < new Date(),
            ).length;

        const totalUsage =
            coupons.reduce(

                (sum, coupon) =>
                    sum +
                    (coupon.usedCount || 0),

                0,

            );

        return {

            success: true,

            message:
                'Coupon report fetched successfully.',

            data: {

                totalCoupons,
                activeCoupons,
                expiredCoupons,
                totalUsage,
                coupons,

            },

        };

    }

    async getReviewReport(
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
            await this.reviewModel

                .find({

                    salonId: salon._id,

                    isDeleted: false,

                })

                .populate('customerId')
                .populate('serviceId')
                .populate('staffId');

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

                        ) /

                        totalReviews

                    ).toFixed(1),

                )

                : 0;

        const fiveStarReviews =
            reviews.filter(
                review =>
                    review.rating === 5,
            ).length;

        return {

            success: true,

            message:
                'Review report fetched successfully.',

            data: {

                totalReviews,

                averageRating,

                fiveStarReviews,

                reviews,

            },

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

        const totalRevenue =
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

                        amount: {

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
                    totalRevenue[0]?.amount || 0,

                totalCustomers,

                totalAppointments,

                totalCommissions,

            },

        };

    }

    async getYearlyReport(
        userId: string,
        query: GetYearlyReportDto,
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

        const year =
            Number(query.year) ||
            new Date().getFullYear();

        const startDate =
            new Date(
                year,
                0,
                1,
            );

        const endDate =
            new Date(
                year,
                11,
                31,
                23,
                59,
                59,
                999,
            );

        const totalRevenue =
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

                        amount: {

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

        return {

            success: true,

            message:
                'Yearly report fetched successfully.',

            data: {

                year,

                totalRevenue:
                    totalRevenue[0]?.amount || 0,

                totalCustomers,

                totalAppointments,

            },

        };

    }

    async getAdminReports(
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
                'Admin reports fetched successfully.',

            data: {

                totalSalons,

                totalCustomers,

                totalAppointments,

                totalRevenue:
                    totalRevenue[0]?.amount || 0,

            },

        };

    }

}