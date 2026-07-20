import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateReviewStatusDto {

    @IsOptional()
    @IsBoolean()
    isApproved?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}