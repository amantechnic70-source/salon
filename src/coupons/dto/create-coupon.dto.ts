import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateCouponDto {

    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    discountType: string;

    @IsNumber()
    @Min(1)
    discountValue: number;

    @IsNumber()
    @Min(0)
    minimumAmount: number;

    @IsNumber()
    @Min(0)
    maximumDiscount: number;

    @IsNumber()
    @Min(1)
    usageLimit: number;

    @IsDateString()
    expiryDate: Date;

}