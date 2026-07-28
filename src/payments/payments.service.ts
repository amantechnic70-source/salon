import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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
import { User, UserDocument } from "src/schemas/user.schema";
import { ConfigService } from "@nestjs/config";


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

        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,

        private readonly razorpayService:
            RazorpayService,

        private readonly configService:
            ConfigService,

    ) { }

    async createOrder(
        userId: string,
        dto: CreateOrderDto,
    ) {

        // ==========================================
        // 1. FIND USER
        // ==========================================

        const user =
            await this.userModel
                .findById(userId)
                .select(
                    "_id role isActive isDeleted salonId",
                )
                .lean();

        if (!user) {

            throw new NotFoundException(
                "User not found.",
            );

        }


        // ==========================================
        // 2. VALIDATE ACCOUNT
        // ==========================================

        if (user.isDeleted) {

            throw new ForbiddenException(
                "Your account has been deleted.",
            );

        }

        if (!user.isActive) {

            throw new ForbiddenException(
                "Your account is inactive.",
            );

        }


        // ==========================================
        // 3. ONLY SALON OWNER CAN PURCHASE
        // ==========================================

        if (
            user.role !==
            UserRole.SALON_OWNER
        ) {

            throw new ForbiddenException(
                "Only salon owners can purchase a subscription.",
            );

        }


        // ==========================================
        // 4. CHECK SALON
        // ==========================================
        // According to your onboarding flow,
        // payment happens BEFORE salon creation.

        if (user.salonId) {

            throw new BadRequestException(
                "Salon has already been created.",
            );

        }


        // ==========================================
        // 5. FIND SUBSCRIPTION PLAN
        // ==========================================

        if (
            !Types.ObjectId.isValid(
                dto.planId,
            )
        ) {

            throw new BadRequestException(
                "Invalid subscription plan ID.",
            );

        }

        const plan =
            await this.planModel
                .findById(dto.planId)
                .lean();

        if (!plan) {

            throw new NotFoundException(
                "Subscription plan not found.",
            );

        }


        // ==========================================
        // 6. CHECK PLAN STATUS
        // ==========================================

        if (!plan.isActive) {

            throw new BadRequestException(
                "Subscription plan is not active.",
            );

        }


        // ==========================================
        // 7. CHECK EXISTING ACTIVE SUBSCRIPTION
        // ==========================================

        const activeSubscription =
            await this.subscriptionModel
                .findOne({

                    userId:
                        user._id,

                    status:
                        "ACTIVE",

                    endDate: {
                        $gt: new Date(),
                    },

                })
                .lean();

        if (activeSubscription) {

            throw new BadRequestException(
                "You already have an active subscription.",
            );

        }


        // ==========================================
        // 8. CHECK EXISTING PENDING PAYMENT
        // ==========================================

        const existingPayment =
            await this.paymentModel
                .findOne({

                    userId:
                        user._id,

                    planId:
                        plan._id,

                    paymentStatus:
                        "PENDING",

                })
                .sort({
                    createdAt: -1,
                });

        /*
         * Optional:
         *
         * You can reuse a recent pending Razorpay
         * order instead of creating many orders when
         * the user repeatedly clicks Pay.
         *
         * For now we create a new order.
         */


        // ==========================================
        // 9. GET RAZORPAY INSTANCE
        // ==========================================

        const razorpay =
            this.razorpayService
                .getInstance();


        // ==========================================
        // 10. VALIDATE AMOUNT
        // ==========================================

        const planAmount =
            Number(plan.amount);

        if (
            !Number.isFinite(planAmount) ||
            planAmount <= 0
        ) {

            throw new BadRequestException(
                "Invalid subscription plan amount.",
            );

        }


        // Razorpay expects smallest currency unit.
        // INR 999 -> 99900 paise

        const amountInPaise =
            Math.round(
                planAmount * 100,
            );


        // ==========================================
        // 11. GENERATE INTERNAL PAYMENT ID
        // ==========================================

        const paymentId =
            `PAY${Date.now()}`;


        // ==========================================
        // 12. CREATE RAZORPAY ORDER
        // ==========================================

        let razorpayOrder;

        try {

            razorpayOrder =
                await razorpay.orders.create({

                    amount:
                        amountInPaise,

                    currency:
                        "INR",

                    receipt:
                        paymentId,

                    notes: {

                        userId:
                            user._id.toString(),

                        planId:
                            plan._id.toString(),

                        paymentId,

                    },

                });

        } catch (error) {

            throw new InternalServerErrorException(
                "Unable to create payment order. Please try again.",
            );

        }


        // ==========================================
        // 13. CREATE PAYMENT RECORD
        // ==========================================

        try {

            const payment =
                await this.paymentModel.create({

                    paymentId,

                    userId:
                        user._id,

                    salonId:
                        null,

                    planId:
                        plan._id,

                    amount:
                        planAmount,

                    currency:
                        razorpayOrder.currency,

                    provider:
                        "RAZORPAY",

                    orderId:
                        razorpayOrder.id,

                    paymentStatus:
                        "PENDING",

                    isRefunded:
                        false,

                });


            // ======================================
            // 14. RESPONSE
            // ======================================

            return {

                success: true,

                message:
                    "Razorpay order created successfully.",

                data: {

                    paymentId:
                        payment.paymentId,

                    orderId:
                        razorpayOrder.id,

                    // Razorpay checkout needs paise.

                    amount:
                        razorpayOrder.amount,

                    currency:
                        razorpayOrder.currency,

                    razorpayKeyId:
                        this.configService
                            .getOrThrow<string>(
                                "RAZORPAY_KEY_ID",
                            ),

                    plan: {

                        id:
                            plan._id,

                        name:
                            plan.name,

                        amount:
                            planAmount,

                    },

                },

            };

        } catch (error) {

            /*
             * Razorpay order exists but DB payment
             * record creation failed.
             *
             * Don't return the order to the frontend
             * because your backend cannot safely
             * verify it later without its payment
             * record.
             */

            throw new InternalServerErrorException(
                "Payment order was created but could not be saved. Please try again.",
            );

        }

    }

    async verifyPayment(
        userId: string,
        dto: VerifyPaymentDto,
    ) {

        // ==========================================
        // 1. VALIDATE USER
        // ==========================================

        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException(
                'Invalid user ID.',
            );
        }

        const user =
            await this.userModel.findById(
                userId,
            );

        if (!user) {
            throw new NotFoundException(
                'User not found.',
            );
        }

        if (user.isDeleted) {
            throw new ForbiddenException(
                'Your account has been deleted.',
            );
        }

        if (!user.isActive) {
            throw new ForbiddenException(
                'Your account is inactive.',
            );
        }

        if (
            user.role !==
            UserRole.SALON_OWNER
        ) {
            throw new ForbiddenException(
                'Only salon owners can verify subscription payments.',
            );
        }


        // ==========================================
        // 2. FIND PAYMENT
        // ==========================================

        const payment =
            await this.paymentModel.findOne({

                orderId:
                    dto.razorpay_order_id,

                userId:
                    user._id,

            });

        if (!payment) {
            throw new BadRequestException(
                'Payment record not found.',
            );
        }


        // ==========================================
        // 3. HANDLE ALREADY VERIFIED PAYMENT
        // ==========================================

        if (
            payment.paymentStatus ===
            PaymentStatus.SUCCESS
        ) {

            const existingSubscription =
                await this.subscriptionModel
                    .findOne({

                        userId:
                            user._id,

                        paymentId:
                            payment._id,

                    });

            return {

                success: true,

                message:
                    'Payment has already been verified.',

                data: {

                    paymentId:
                        payment.paymentId,

                    subscription:
                        existingSubscription,

                    nextStep:
                        user.salonId
                            ? '/salon/dashboard'
                            : '/salon-onboarding',

                },

            };
        }


        // ==========================================
        // 4. PAYMENT MUST BE PENDING
        // ==========================================

        if (
            payment.paymentStatus !==
            PaymentStatus.PENDING
        ) {
            throw new BadRequestException(
                'Payment cannot be verified in its current status.',
            );
        }


        // ==========================================
        // 5. MAKE SURE PAYMENT ID IS PRESENT
        // ==========================================

        if (!dto.razorpay_payment_id) {
            throw new BadRequestException(
                'Razorpay payment ID is required.',
            );
        }

        if (!dto.razorpay_signature) {
            throw new BadRequestException(
                'Razorpay signature is required.',
            );
        }


        // ==========================================
        // 6. VERIFY RAZORPAY SIGNATURE
        // ==========================================

        const razorpaySecret =
            this.configService
                .getOrThrow<string>(
                    'RAZORPAY_KEY_SECRET',
                );

        const body =
            `${payment.orderId}|${dto.razorpay_payment_id}`;

        const expectedSignature =
            crypto
                .createHmac(
                    'sha256',
                    razorpaySecret,
                )
                .update(body)
                .digest('hex');


        // Timing-safe comparison

        const expectedBuffer =
            Buffer.from(
                expectedSignature,
                'utf8',
            );

        const receivedBuffer =
            Buffer.from(
                dto.razorpay_signature,
                'utf8',
            );

        const signatureValid =
            expectedBuffer.length ===
            receivedBuffer.length &&
            crypto.timingSafeEqual(
                expectedBuffer,
                receivedBuffer,
            );

        if (!signatureValid) {
            throw new BadRequestException(
                'Invalid payment signature.',
            );
        }


        // ==========================================
        // 7. FIND PLAN FROM PAYMENT
        // ==========================================
        // Do NOT trust dto.planId here.
        // createOrder already stored the selected plan.

        const plan =
            await this.planModel.findById(
                payment.planId,
            );

        if (!plan) {
            throw new BadRequestException(
                'Subscription plan not found.',
            );
        }

        if (!plan.isActive) {
            throw new BadRequestException(
                'Subscription plan is no longer active.',
            );
        }


        // ==========================================
        // 8. CHECK EXISTING SUBSCRIPTION
        // ==========================================

        const existingPaymentSubscription =
            await this.subscriptionModel
                .findOne({

                    userId:
                        user._id,

                    paymentId:
                        payment._id,

                });

        if (existingPaymentSubscription) {

            // Payment verification was probably
            // already processed previously.

            payment.paymentStatus =
                PaymentStatus.SUCCESS;

            payment.paymentMethod =
                'ONLINE';

            payment.razorpayPaymentId =
                dto.razorpay_payment_id;

            payment.razorpaySignature =
                dto.razorpay_signature;

            await payment.save();

            return {

                success: true,

                message:
                    'Payment verified successfully.',

                data: {

                    paymentId:
                        payment.paymentId,

                    subscription:
                        existingPaymentSubscription,

                    nextStep:
                        user.salonId
                            ? '/salon/dashboard'
                            : '/salon-onboarding',

                },

            };
        }


        // ==========================================
        // 9. DEACTIVATE CURRENT ACTIVE SUBSCRIPTION
        // ==========================================

        const currentSubscription =
            await this.subscriptionModel
                .findOne({

                    userId:
                        user._id,

                    status:
                        SubscriptionStatus.ACTIVE,

                    isActive:
                        true,

                });

        if (currentSubscription) {

            currentSubscription.status =
                SubscriptionStatus.UPGRADED;

            currentSubscription.isActive =
                false;

            await currentSubscription.save();

        }


        // ==========================================
        // 10. GENERATE SUBSCRIPTION ID
        // ==========================================

        // Better than countDocuments because
        // simultaneous requests could generate
        // the same sequential ID.

        const subscriptionId =
            `SUB${Date.now()}${Math.floor(
                1000 + Math.random() * 9000,
            )}`;


        // ==========================================
        // 11. CALCULATE SUBSCRIPTION DATES
        // ==========================================

        const startDate =
            new Date();

        const expiryDate =
            new Date(startDate);

        expiryDate.setDate(
            expiryDate.getDate() +
            plan.durationInDays,
        );


        // ==========================================
        // 12. MARK PAYMENT SUCCESS
        // ==========================================

        payment.paymentStatus =
            PaymentStatus.SUCCESS;

        payment.paymentMethod =
            'ONLINE';

        payment.razorpayPaymentId =
            dto.razorpay_payment_id;

        payment.razorpaySignature =
            dto.razorpay_signature;

        await payment.save();


        // ==========================================
        // 13. CREATE TRANSACTION
        // ==========================================

        const existingTransaction =
            await this.transactionModel
                .findOne({

                    transactionId:
                        dto.razorpay_payment_id,

                });

        if (!existingTransaction) {

            await this.transactionModel.create({

                paymentId:
                    payment._id,

                transactionId:
                    dto.razorpay_payment_id,

                amount:
                    payment.amount,

                status:
                    PaymentStatus.SUCCESS,

            });

        }


        // ==========================================
        // 14. CREATE SUBSCRIPTION
        // ==========================================
        // Salon doesn't exist yet.
        // Therefore subscription belongs to USER.

        const subscription =
            await this.subscriptionModel.create({

                subscriptionId,

                userId:
                    user._id,

                salonId:
                    user.salonId ?? null,

                paymentId:
                    payment._id,

                planId:
                    plan._id,

                amount:
                    payment.amount,

                startDate,

                expiryDate,

                status:
                    SubscriptionStatus.ACTIVE,

                isActive:
                    true,

            });

        user.isSubscriptionActive = true;
        await user.save();


        // ==========================================
        // 15. EXISTING SALON CASE
        // ==========================================
        // Useful later for renewal/upgrade.

        if (user.salonId) {

            await this.salonModel.findByIdAndUpdate(

                user.salonId,

                {
                    $set: {
                        isSubscriptionActive:
                            true,
                    },
                },

            );

            if (!payment.salonId) {

                payment.salonId =
                    user.salonId;

                await payment.save();

            }

        }


        // ==========================================
        // 16. RETURN RESPONSE
        // ==========================================

        return {

            success: true,

            message:
                'Payment verified successfully.',

            data: {

                payment: {

                    paymentId:
                        payment.paymentId,

                    orderId:
                        payment.orderId,

                    razorpayPaymentId:
                        payment.razorpayPaymentId,

                    amount:
                        payment.amount,

                    currency:
                        payment.currency,

                    status:
                        payment.paymentStatus,

                },

                subscription,

                nextStep:
                    user.salonId
                        ? '/salon/dashboard'
                        : '/salon-onboarding',

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

        const payment =
            await this.paymentModel.findOne({
                paymentId: dto.paymentId,
            });

        if (!payment) {
            throw new NotFoundException(
                'Payment not found.',
            );
        }

        if (
            payment.paymentStatus !==
            'SUCCESS'
        ) {
            throw new BadRequestException(
                'Only successful payments can be refunded.',
            );
        }

        if (payment.isRefunded) {
            throw new BadRequestException(
                'Payment has already been refunded.',
            );
        }

        // IMPORTANT:
        // Payment may be PENDING/FAILED and therefore
        // razorpayPaymentId can legitimately be null.

        if (!payment.razorpayPaymentId) {
            throw new BadRequestException(
                'Razorpay payment ID not found.',
            );
        }

        const razorpay =
            this.razorpayService.getInstance();

        const refund =
            await razorpay.payments.refund(
                payment.razorpayPaymentId,
                {
                    amount:
                        Math.round(
                            payment.amount * 100,
                        ),
                },
            );

        payment.isRefunded = true;

        payment.paymentStatus =
            'REFUNDED';

        payment.refundedAt =
            new Date();

        await payment.save();

        return {
            success: true,

            message:
                'Payment refunded successfully.',

            data: {
                paymentId:
                    payment.paymentId,

                razorpayPaymentId:
                    payment.razorpayPaymentId,

                refundId:
                    refund.id,

                amount:
                    payment.amount,

                status:
                    payment.paymentStatus,
            },
        };
    }

}