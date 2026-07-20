import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateCommissionStatusDto {

    @IsOptional()
    @IsString()
    commissionStatus?: string;

    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}