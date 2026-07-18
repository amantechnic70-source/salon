import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateCustomerStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}