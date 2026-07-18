import {
    IsMongoId,
    IsString,
} from 'class-validator';

export class VerifyPaymentDto {

    @IsMongoId()
    planId: string;

    @IsString()
    razorpay_order_id: string;

    @IsString()
    razorpay_payment_id: string;

    @IsString()
    razorpay_signature: string;

}