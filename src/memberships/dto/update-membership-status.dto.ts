import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateMembershipStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}