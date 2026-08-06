
import { VerifyAppointmentPaymentDto } from './dto/appointment/verify-appointment-payment.dto';
import { GetAppointmentPaymentsDto } from './dto/appointment/get-appointment-payments.dto';
import { CreateAppointmentOrderDto } from './dto/appointment/create-appointment-order.dto';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { ConfigService } from '@nestjs/config';

import { RazorpayService } from './providers/razorpay/razorpay.service';

import {
    User,
    UserDocument,
} from 'src/schemas/user.schema';

import {
    Customer,
    CustomerDocument,
} from 'src/schemas/customer.schema';

import {
    Salon,
    SalonDocument,
} from 'src/schemas/salon.schema';

import {
    Branch,
    BranchDocument,
} from 'src/schemas/branch.schema';

import {
    Staff,
    StaffDocument,
} from 'src/schemas/staff.schema';

import {
    Service,
    ServiceDocument,
} from 'src/schemas/service.schema';

import {
    Appointment,
    AppointmentDocument,
} from 'src/schemas/appointment.schema';

import {
    Payment,
    PaymentDocument,
} from 'src/schemas/payment.schema';

import {
    Transaction,
    TransactionDocument,
} from 'src/schemas/transaction.schema';

import {
    Subscription,
    SubscriptionDocument,
} from 'src/schemas/subscription.schema';

import {
    SubscriptionPlan,
    SubscriptionPlanDocument,
} from 'src/schemas/subscription-plan.schema';

import * as crypto from 'crypto';

@Injectable()
export class AppointmentPaymentService {

    constructor(

        @InjectModel(User.name)
        private readonly userModel:
            Model<UserDocument>,

        @InjectModel(Customer.name)
        private readonly customerModel:
            Model<CustomerDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        @InjectModel(Branch.name)
        private readonly branchModel:
            Model<BranchDocument>,

        @InjectModel(Staff.name)
        private readonly staffModel:
            Model<StaffDocument>,

        @InjectModel(Service.name)
        private readonly serviceModel:
            Model<ServiceDocument>,

        @InjectModel(Appointment.name)
        private readonly appointmentModel:
            Model<AppointmentDocument>,

        @InjectModel(Payment.name)
        private readonly paymentModel:
            Model<PaymentDocument>,

        @InjectModel(Transaction.name)
        private readonly transactionModel:
            Model<TransactionDocument>,

        @InjectModel(Subscription.name)
        private readonly subscriptionModel:
            Model<SubscriptionDocument>,

        @InjectModel(SubscriptionPlan.name)
        private readonly subscriptionPlanModel:
            Model<SubscriptionPlanDocument>,

        private readonly razorpayService:
            RazorpayService,

        private readonly configService:
            ConfigService,

    ) { }

    // ==========================================
    // CREATE APPOINTMENT ORDER
    // PART 1 : VALIDATIONS
    // ==========================================

    async createAppointmentOrder(
        userId: string,
        dto: CreateAppointmentOrderDto,
    ) {

        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        if (user.isDeleted) {

            throw new BadRequestException(
                'User account has been deleted.',
            );

        }

        if (!user.isActive) {

            throw new BadRequestException(
                'User account is inactive.',
            );

        }

        // ==========================================
        // FIND CUSTOMER
        // ==========================================

        const customer =
            await this.customerModel.findOne({

                userId:
                    user._id,

                isDeleted:
                    false,

                isActive:
                    true,

            });

        if (!customer) {

            throw new BadRequestException(
                'Customer profile not found.',
            );

        }

        // ==========================================
        // FIND SALON
        // ==========================================

        const salon =
            await this.salonModel.findOne({

                _id:
                    dto.salonId,

                isDeleted:
                    false,

                isActive:
                    true,

                isVerified:
                    true,

                isSubscriptionActive:
                    true,

            });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }

        // ==========================================
        // FIND BRANCH
        // ==========================================

        const branch =
            await this.branchModel.findOne({

                _id:
                    dto.branchId,

                salonId:
                    salon._id,

                isDeleted:
                    false,

                isActive:
                    true,

            });

        if (!branch) {

            throw new BadRequestException(
                'Branch not found.',
            );

        }

        // ==========================================
        // FIND STAFF
        // ==========================================

        const staff =
            await this.staffModel.findOne({

                _id:
                    dto.staffId,

                salonId:
                    salon._id,

                branchId:
                    branch._id,

                isDeleted:
                    false,

                isActive:
                    true,

            });

        if (!staff) {

            throw new BadRequestException(
                'Staff not found.',
            );

        }

        const services =
            await this.serviceModel.find({

                _id: {

                    $in:
                        dto.serviceIds,

                },

                salonId:
                    salon._id,

                branchId:
                    branch._id,

                isDeleted:
                    false,

                isActive:
                    true,

            });

        if (

            services.length !==
            dto.serviceIds.length

        ) {

            throw new BadRequestException(
                'One or more selected services are invalid.',
            );

        }

        // ==========================================
        // CHECK SLOT
        // ==========================================

        const existingAppointment =
            await this.appointmentModel.findOne({

                staffId:
                    staff._id,

                appointmentDate:
                    new Date(
                        dto.appointmentDate,
                    ),

                appointmentTime:
                    dto.appointmentTime,

                isCancelled:
                    false,

            });

        if (existingAppointment) {

            throw new BadRequestException(
                'Selected slot is already booked.',
            );

        }

        // ==========================================
        // CALCULATE TOTAL AMOUNT
        // ==========================================

        let totalAmount = 0;
        let discountAmount = 0;

        for (const service of services) {

            totalAmount += service.price;

            if (service.discount > 0) {

                discountAmount +=
                    (service.price * service.discount) / 100;

            }

        }

        const finalAmount =
            totalAmount - discountAmount;

        // ==========================================
        // GENERATE PAYMENT ID
        // ==========================================

        const totalPayments =
            await this.paymentModel.countDocuments();

        const paymentId =
            `PAY${String(
                totalPayments + 1,
            ).padStart(6, '0')}`;

        // ==========================================
        // CREATE RAZORPAY ORDER
        // ==========================================

        const razorpay =
            this.razorpayService.getInstance();

        const order =
            await razorpay.orders.create({

                amount:
                    Math.round(
                        finalAmount * 100,
                    ),

                currency:
                    'INR',

                receipt:
                    paymentId,

                notes: {

                    paymentType:
                        'APPOINTMENT',

                    customerId:
                        customer._id.toString(),

                    salonId:
                        salon._id.toString(),

                },

            });

        // ==========================================
        // CREATE PAYMENT
        // ==========================================

        const payment =
            await this.paymentModel.create({

                paymentId,

                paymentType:
                    'APPOINTMENT',

                appointmentId:
                    null,

                userId:
                    user._id,

                salonId:
                    salon._id,

                planId:
                    null,

                amount:
                    finalAmount,

                currency:
                    'INR',

                provider:
                    'RAZORPAY',

                orderId:
                    order.id,

                paymentStatus:
                    'PENDING',

                paymentMethod:
                    'ONLINE',

                bookingData: {

                    salonId:
                        salon._id,

                    branchId:
                        branch._id,

                    customerId:
                        customer._id,

                    staffId:
                        staff._id,

                    serviceIds:
                        dto.serviceIds,

                    appointmentDate:
                        dto.appointmentDate,

                    appointmentTime:
                        dto.appointmentTime,

                    notes:
                        dto.notes,

                    totalAmount,

                    discountAmount,

                    finalAmount,

                },

            });

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return {

            success: true,

            message:
                'Appointment payment order created successfully.',

            data: {

                paymentId:
                    payment.paymentId,

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                key:
                    this.configService.get<string>(
                        'RAZORPAY_KEY_ID',
                    ),

            },

        };

    }

    // ==========================================
    // VERIFY APPOINTMENT PAYMENT
    // ==========================================

    async verifyAppointmentPayment(
        userId: string,
        dto: VerifyAppointmentPaymentDto,
    ) {

        // ==========================================
        // VERIFY USER
        // ==========================================

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        if (user.isDeleted) {

            throw new BadRequestException(
                'User account has been deleted.',
            );

        }

        if (!user.isActive) {

            throw new BadRequestException(
                'User account is inactive.',
            );

        }

        // ==========================================
        // FIND PAYMENT
        // ==========================================

        const payment =
            await this.paymentModel.findOne({

                orderId:
                    dto.razorpay_order_id,

                paymentType:
                    'APPOINTMENT',

                paymentStatus:
                    'PENDING',

            });

        if (!payment) {

            throw new BadRequestException(
                'Payment not found.',
            );

        }

        // ==========================================
        // CHECK PAYMENT OWNER
        // ==========================================

        if (

            payment.userId.toString() !==
            user._id.toString()

        ) {

            throw new UnauthorizedException(
                'You are not authorized to verify this payment.',
            );

        }

        // ==========================================
        // VERIFY SIGNATURE
        // ==========================================

        const body =
            dto.razorpay_order_id +
            "|" +
            dto.razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(

                    'sha256',

                    this.configService.get<string>(
                        'RAZORPAY_KEY_SECRET',
                    )!,

                )
                .update(body)
                .digest('hex');

        if (

            expectedSignature !==
            dto.razorpay_signature

        ) {

            payment.paymentStatus =
                'FAILED';

            payment.failureReason =
                'Invalid Razorpay Signature';

            await payment.save();

            throw new BadRequestException(
                'Invalid payment signature.',
            );

        }
        // ==========================================
        // UPDATE PAYMENT SUCCESS
        // ==========================================

        payment.paymentStatus =
            'SUCCESS';

        payment.paymentMethod =
            'ONLINE';

        payment.razorpayPaymentId =
            dto.razorpay_payment_id;

        payment.razorpaySignature =
            dto.razorpay_signature;

        payment.failureReason =
            null;

        await payment.save();

        // ==========================================
        // READ BOOKING DATA
        // ==========================================

        const booking =
            payment.bookingData;

        if (!booking) {

            throw new BadRequestException(
                'Booking data not found.',
            );

        }

        // ==========================================
        // GENERATE APPOINTMENT ID
        // ==========================================

        const totalAppointments =
            await this.appointmentModel.countDocuments();

        const appointmentId =
            `APT${String(
                totalAppointments + 1,
            ).padStart(6, '0')}`;

        // ==========================================
        // PREPARE APPOINTMENT DATES
        // ==========================================

        const appointmentDate =
            new Date(
                booking.appointmentDate,
            );

        const bookedAt =
            new Date();

        const paidAt =
            new Date();

        // ==========================================
        // CREATE APPOINTMENT
        // ==========================================

        const appointment =
            await this.appointmentModel.create({

                paymentId:
                    payment._id,

                transactionId:
                    null,

                bookingSource:
                    'CUSTOMER',

                paymentMethod:
                    'ONLINE',

                appointmentId,

                salonId:
                    booking.salonId,

                branchId:
                    booking.branchId,

                customerId:
                    booking.customerId,

                staffId:
                    booking.staffId,

                serviceIds:
                    booking.serviceIds,

                membershipId:
                    booking.membershipId ||
                    null,

                couponId:
                    booking.couponId ||
                    null,

                appointmentDate:
                    appointmentDate,

                appointmentTime:
                    booking.appointmentTime,

                totalAmount:
                    booking.totalAmount,

                discountAmount:
                    booking.discountAmount,

                finalAmount:
                    booking.finalAmount,

                paymentStatus:
                    'SUCCESS',

                appointmentStatus:
                    'CONFIRMED',

                notes:
                    booking.notes,

                bookedAt,

                paidAt,

                cancelReason:
                    null,

                cancelledBy:
                    null,

                isCompleted:
                    false,

                isCancelled:
                    false,

                isDeleted:
                    false,

            });

        // ==========================================
        // GENERATE TRANSACTION ID
        // ==========================================

        const totalTransactions =
            await this.transactionModel.countDocuments();

        const transactionId =
            `TRN${String(
                totalTransactions + 1,
            ).padStart(6, '0')}`;

        // ==========================================
        // CREATE TRANSACTION
        // ==========================================

        const transaction =
            await this.transactionModel.create({

                paymentId:
                    payment._id,

                appointmentId:
                    appointment._id,

                userId:
                    user._id,

                salonId:
                    booking.salonId,

                transactionId:
                    transactionId,

                amount:
                    payment.amount,

                provider:
                    payment.provider,

                providerTransactionId:
                    dto.razorpay_payment_id,

                status:
                    'SUCCESS',

            });

        // ==========================================
        // UPDATE PAYMENT
        // ==========================================

        payment.appointmentId =
            appointment._id;

        await payment.save();

        // ==========================================
        // UPDATE APPOINTMENT
        // ==========================================

        appointment.transactionId =
            transaction._id;

        await appointment.save();

        // ==========================================
        // POPULATE APPOINTMENT
        // ==========================================

        const appointmentDetails =
            await this.appointmentModel
                .findById(
                    appointment._id,
                )
                .populate(
                    'salonId',
                    'name logo phone',
                )
                .populate(
                    'branchId',
                    'name address',
                )
                .populate(
                    'customerId',
                    'name phone',
                )
                .populate(
                    'staffId',
                    'name designation',
                )
                .populate(
                    'serviceIds',
                    'name price duration',
                );

        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return {

            success: true,

            message:
                'Appointment booked successfully.',

            data: {

                paymentId:
                    payment.paymentId,

                transactionId:
                    transaction.transactionId,

                appointment:
                    appointmentDetails,

            },

        };

    }


    // ==========================================
    // APPOINTMENT PAYMENT HISTORY
    // ==========================================

    async appointmentPaymentHistory(
        userId: string,
        query: GetAppointmentPaymentsDto,
    ) {

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        if (user.isDeleted) {

            throw new BadRequestException(
                'User account has been deleted.',
            );

        }

        if (!user.isActive) {

            throw new BadRequestException(
                'User account is inactive.',
            );

        }

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter: any = {

            userId:
                user._id,

            paymentType:
                'APPOINTMENT',

        };

        if (
            query.paymentStatus
        ) {

            filter.paymentStatus =
                query.paymentStatus;

        }

        if (
            query.paymentMethod
        ) {

            filter.paymentMethod =
                query.paymentMethod;

        }

        const total =
            await this.paymentModel.countDocuments(
                filter,
            );

        const payments =
            await this.paymentModel
                .find(filter)
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
                .populate({

                    path:
                        'appointmentId',

                    populate: [

                        {

                            path:
                                'salonId',

                            select:
                                'name logo',

                        },

                        {

                            path:
                                'branchId',

                            select:
                                'name',

                        },

                        {

                            path:
                                'staffId',

                            select:
                                'name designation',

                        },

                        {

                            path:
                                'serviceIds',

                            select:
                                'name price duration',

                        },

                    ],

                });

        return {

            success: true,

            message:
                'Appointment payment history fetched successfully.',

            data:
                payments,

            pagination: {

                total,

                page,

                limit,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),

            },

        };

    }


    // ==========================================
    // APPOINTMENT PAYMENT DETAILS
    // ==========================================

    async appointmentPaymentDetails(
        userId: string,
        paymentId: string,
    ) {

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        if (user.isDeleted) {

            throw new BadRequestException(
                'User account has been deleted.',
            );

        }

        if (!user.isActive) {

            throw new BadRequestException(
                'User account is inactive.',
            );

        }

        const payment =
            await this.paymentModel
                .findOne({

                    _id:
                        paymentId,

                    userId:
                        user._id,

                    paymentType:
                        'APPOINTMENT',

                })
                .populate({

                    path:
                        'appointmentId',

                    populate: [

                        {

                            path:
                                'salonId',

                            select:
                                'name logo email phone address city state country pincode',

                        },

                        {

                            path:
                                'branchId',

                            select:
                                'name address phone openingTime closingTime',

                        },

                        {

                            path:
                                'customerId',

                            select:
                                'name email phone profileImage',

                        },

                        {

                            path:
                                'staffId',

                            select:
                                'name designation profileImage',

                        },

                        {

                            path:
                                'serviceIds',

                            select:
                                'name category price discount discountPrice duration serviceImage',

                        },

                        {

                            path:
                                'transactionId',

                        },

                    ],

                });

        if (!payment) {

            throw new BadRequestException(
                'Payment not found.',
            );

        }

        return {

            success: true,

            message:
                'Appointment payment details fetched successfully.',

            data:
                payment,

        };

    }


}