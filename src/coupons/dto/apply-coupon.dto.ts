import {
    IsNumber,
    IsString,
    Min,
} from 'class-validator';

export class ApplyCouponDto {

    @IsString()
    code: string;

    @IsNumber()
    @Min(1)
    amount: number;

}