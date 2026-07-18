import {
    IsMongoId,
} from 'class-validator';

export class RefundPaymentDto {

    @IsMongoId()
    paymentId: string;

}