import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class UpdateCouponDto {

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    discountType?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    discountValue?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minimumAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maximumDiscount?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    usageLimit?: number;

    @IsOptional()
    @IsDateString()
    expiryDate?: Date;

}