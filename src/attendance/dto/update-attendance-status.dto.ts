import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateAttendanceStatusDto {

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsBoolean()
    isLate?: boolean;

    @IsOptional()
    @IsBoolean()
    isHalfDay?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

}