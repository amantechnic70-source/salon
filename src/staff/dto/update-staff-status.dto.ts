import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateStaffStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}