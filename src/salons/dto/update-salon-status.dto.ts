import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateSalonStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}