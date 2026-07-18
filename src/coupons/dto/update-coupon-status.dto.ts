import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateCouponStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}