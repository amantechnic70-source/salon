import {
    IsBoolean,
    IsOptional,
} from 'class-validator';

export class UpdateServiceStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}