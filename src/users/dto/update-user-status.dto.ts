// update-user-status.dto.ts

import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;

    @IsOptional()
    @IsString()
    role?: string;

}