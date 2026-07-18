import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as crypto from "crypto";
import {
    Payment,
    PaymentDocument,
} from "../schemas/payment.schema";

import {
    Transaction,
    TransactionDocument,
} from "../schemas/transaction.schema";

import {

    Subscription,
    SubscriptionDocument,

} from "../schemas/subscription.schema";

import {
    SubscriptionPlan,
    SubscriptionPlanDocument,
} from "../schemas/subscription-plan.schema";

import {
    Salon,
    SalonDocument,

} from "../schemas/salon.schema";

import { RazorpayService } from "./providers/razorpay/razorpay.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { RefundPaymentDto } from "./dto/refund-payment.dto";
import { SubscriptionStatus } from "src/common/enums/subscription-status.enum";
import { PaymentStatus } from "src/common/enums/payment-status.enum";
import { UserRole } from "src/common/enums/user-role.enum";


@Injectable()
export class PaymentsService {

    constructor(

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
        private readonly planModel:
            Model<SubscriptionPlanDocument>,

        @InjectModel(Salon.name)
        private readonly salonModel:
            Model<SalonDocument>,

        private readonly razorpayService:
            RazorpayService,

    ) { }

    async createOrder(
        userId: string,
        dto: CreateOrderDto,
    ) {

        // Find Salon

        const salon = await this.salonModel.findOne({
            ownerId: userId,
            isDeleted: false,
        });

        if (!salon) {

            throw new BadRequestException(
                'Salon not found.',
            );

        }


        // Find Subscription Plan

        const plan = await this.planModel.findById(
            dto.planId,
        );

        if (!plan) {

            throw new BadRequestException(
                'Subscription plan not found.',
            );

        }


        // Check Plan Active

        if (!plan.isActive) {

            throw new BadRequestException(
                'Subscription plan is not active.',
            );

        }

        // Create Razorpay Order
        const razorpay =
            this.razorpayService.getInstance();

        const razorpayOrder =
            await razorpay.orders.create({
                amount: plan.amount * 100,
                currency: 'INR',
                receipt:
                    `receipt_${Date.now()}`,

            });

        // Generate Payment ID
        const totalPayments =
            await this.paymentModel.countDocuments();
        const paymentId =
            `PAY${String(
                totalPayments + 1,
            ).padStart(6, '0')}`;


        // Create Payment Record

        const payment =
            await this.paymentModel.create({
                paymentId,
                salonId: salon._id,
                planId: plan._id,
                amount: plan.amount,
                currency: 'INR',
                provider: 'RAZORPAY',
                orderId: razorpayOrder.id,
                paymentStatus: 'PENDING',
                isRefunded: false,
            });

        // Return Response
        return {
            success: true,
            message:
                'Razorpay order created successfully.',

            data: {

                paymentId:
                    payment.paymentId,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency,

                orderId:
                    razorpayOrder.id,

                razorpayKeyId:
                    process.env
                        .RAZORPAY_KEY_ID,

            },

        };

    }

    async verifyPayment(
        userId: string,
        dto: VerifyPaymentDto,
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

        const payment = await this.paymentModel.findOne({
            orderId: dto.razorpay_order_id,
            paymentStatus: PaymentStatus.PENDING,
        });

        if (!payment) {
            throw new BadRequestException(
                'Payment record not found.',
            );
        }

        const body =
            dto.razorpay_order_id +
            "|" +
            dto.razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!,
            )
            .update(body)
            .digest("hex");

        if (
            expectedSignature !==
            dto.razorpay_signature
        ) {
            throw new BadRequestException(
                'Invalid payment signature.',
            );
        }

        payment.paymentStatus =
            PaymentStatus.SUCCESS;

        payment.paymentMethod =
            'ONLINE';

        payment.razorpayPaymentId =
            dto.razorpay_payment_id;

        payment.razorpaySignature =
            dto.razorpay_signature;

        await payment.save();

        await this.transactionModel.create({
            paymentId: payment._id,
            transactionId:
                dto.razorpay_payment_id,
            amount: payment.amount,
            status: PaymentStatus.SUCCESS,
        });

        const currentSubscription =
            await this.subscriptionModel.findOne({
                salonId: salon._id,
                status: SubscriptionStatus.ACTIVE,
            });

        if (currentSubscription) {
            currentSubscription.status =
                SubscriptionStatus.UPGRADED;

            currentSubscription.isActive =
                false;

            await currentSubscription.save();
        }

        const plan =
            await this.planModel.findById(
                dto.planId,
            );

        if (!plan) {
            throw new BadRequestException(
                'Subscription plan not found.',
            );
        }

        const totalSubscriptions =
            await this.subscriptionModel
                .countDocuments();

        const subscriptionId =
            `SUB${String(
                totalSubscriptions + 1,
            ).padStart(6, '0')}`;

        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(
            expiryDate.getDate() +
            plan.durationInDays,
        );

        const subscription =
            await this.subscriptionModel.create({
                subscriptionId,
                salonId: salon._id,
                planId: plan._id,
                amount: plan.amount,
                startDate,
                expiryDate,
                status:
                    SubscriptionStatus.ACTIVE,
                isActive: true,
            });

        salon.isSubscriptionActive = true;
        await salon.save();
        return {
            success: true,
            message:
                'Payment verified successfully.',
            data: {
                subscription,
            },
        };

    }

    async paymentHistory(
        userId: string,
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

        const payments = await this.paymentModel
            .find({
                salonId: salon._id,
            })
            .populate('planId')
            .sort({
                createdAt: -1,
            });

        const data = await Promise.all(
            payments.map(async (payment) => {

                const transaction =
                    await this.transactionModel.findOne({
                        paymentId: payment._id,
                    });

                return {
                    payment,
                    transaction,
                };

            }),
        );

        return {
            success: true,
            message:
                'Payment history fetched successfully.',
            data,
        };

    }

    async paymentDetails(
        id: string,
    ) {

        const payment = await this.paymentModel
            .findById(id)
            .populate('salonId')
            .populate('planId');

        if (!payment) {
            throw new BadRequestException(
                'Payment not found.',
            );
        }

        const transaction =
            await this.transactionModel.findOne({
                paymentId: payment._id,
            });

        const subscription =
            await this.subscriptionModel.findOne({
                salonId: payment.salonId,
                planId: payment.planId,
            });

        return {
            success: true,
            message:
                'Payment details fetched successfully.',
            data: {
                payment,
                transaction,
                subscription,
            },
        };

    }

    async refundPayment(
        user: any,
        dto: RefundPaymentDto,
    ) {

        if (
            user.role !==
            UserRole.SUPER_ADMIN
        ) {
            throw new UnauthorizedException(
                'Unauthorized.',
            );
        }

        const payment = await this.paymentModel.findById(
            dto.paymentId,
        );

        if (!payment) {
            throw new BadRequestException(
                'Payment not found.',
            );
        }

        if (payment.isRefunded) {
            throw new BadRequestException(
                'Payment has already been refunded.',
            );
        }

        const razorpay =
            this.razorpayService.getInstance();

        await razorpay.payments.refund(
            payment.razorpayPaymentId,
            {
                amount: payment.amount * 100,
            },
        );

        payment.isRefunded = true;
        payment.paymentStatus =
            PaymentStatus.REFUNDED;

        await payment.save();

        const subscription =
            await this.subscriptionModel.findOne({
                salonId: payment.salonId,
                planId: payment.planId,
                status: SubscriptionStatus.ACTIVE,
            });

        if (subscription) {
            subscription.status =
                SubscriptionStatus.CANCELLED;

            subscription.isActive = false;

            await subscription.save();
        }

        const salon = await this.salonModel.findById(
            payment.salonId,
        );

        if (salon) {
            salon.isSubscriptionActive = false;
            await salon.save();
        }

        const transaction =
            await this.transactionModel.findOne({
                paymentId: payment._id,
            });

        if (transaction) {
            transaction.status =
                PaymentStatus.REFUNDED;

            await transaction.save();
        }

        return {
            success: true,
            message:
                'Payment refunded successfully.',
        };

    }

}