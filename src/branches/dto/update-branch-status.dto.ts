import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateBranchStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}